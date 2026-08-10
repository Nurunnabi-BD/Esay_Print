const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Resolve path to the service account key
const serviceAccountPathEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const defaultServiceAccountPath = path.join(__dirname, '../config/serviceAccountKey.json');
const serviceAccountPath = serviceAccountPathEnv ? path.resolve(serviceAccountPathEnv) : defaultServiceAccountPath;

let bucket = null;
let isCloudConfigured = false;

if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = require(serviceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
    });
    
    bucket = admin.storage().bucket();
    isCloudConfigured = true;
    console.log(`Storage Service: Firebase successfully initialized using key: ${path.basename(serviceAccountPath)}`);
  } catch (error) {
    console.error('Storage Service: Failed to initialize Firebase Admin:', error.message);
  }
} else {
  console.log(`Storage Service: Key file not found at ${serviceAccountPath}. Fallback to local storage (uploads/).`);
}

/**
 * Upload a file buffer to storage
 * @param {Buffer} fileBuffer - The file content buffer
 * @param {string} storedName - Unique filename to save under
 * @param {string} mimeType - The file MIME type
 * @returns {Promise<{ fileUrl: string, storageKey: string }>}
 */
const uploadFile = async (fileBuffer, storedName, mimeType) => {
  if (isCloudConfigured && bucket) {
    const file = bucket.file(storedName);
    
    await file.save(fileBuffer, {
      metadata: { contentType: mimeType },
      resumable: false,
    });

    const storageKey = storedName;
    const fileUrl = `https://storage.googleapis.com/${bucket.name}/${storedName}`;

    return { fileUrl, storageKey };
  } else {
    // Local storage path fallback
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, storedName);
    await fs.promises.writeFile(filePath, fileBuffer);

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const fileUrl = `${backendUrl}/uploads/${storedName}`;
    const storageKey = storedName;

    return { fileUrl, storageKey };
  }
};

/**
 * Retrieve a temporary signed access URL for a stored file
 * @param {string} storageKey - File storage identifier
 * @param {number} expiresIn - Expiration time in seconds (default 300s = 5m)
 * @returns {Promise<string>}
 */
const getSignedUrl = async (storageKey, expiresIn = 300) => {
  if (isCloudConfigured && bucket) {
    const file = bucket.file(storageKey);
    
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn * 1000,
    });

    return url;
  } else {
    // Local URL fallback
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    return `${backendUrl}/uploads/${storageKey}`;
  }
};

/**
 * Download file content back into a buffer
 * @param {string} storageKey - File storage identifier
 * @returns {Promise<Buffer>}
 */
const getFileBuffer = async (storageKey) => {
  if (isCloudConfigured && bucket) {
    const file = bucket.file(storageKey);
    const [fileContent] = await file.download();
    return fileContent;
  } else {
    const filePath = path.join(__dirname, '../../uploads', storageKey);
    return await fs.promises.readFile(filePath);
  }
};

/**
 * Remove a file from storage
 * @param {string} storageKey - File storage identifier
 */
const deleteFile = async (storageKey) => {
  if (isCloudConfigured && bucket) {
    const file = bucket.file(storageKey);
    try {
      await file.delete();
    } catch (error) {
      console.error(`Failed to delete Firebase file: ${error.message}`);
    }
  } else {
    // Local delete fallback
    const filePath = path.join(__dirname, '../../uploads', storageKey);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error(`Failed to delete local file: ${error.message}`);
    }
  }
};

module.exports = {
  uploadFile,
  getSignedUrl,
  getFileBuffer,
  deleteFile,
};
