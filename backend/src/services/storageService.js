const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const admin = require('firebase-admin');

// 1. Firebase Admin Configuration (Optional Cloud Fallback)
const serviceAccountJsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
const serviceAccountPathEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const defaultServiceAccountPath = path.join(__dirname, '../config/serviceAccountKey.json');
const serviceAccountPath = serviceAccountPathEnv ? path.resolve(serviceAccountPathEnv) : defaultServiceAccountPath;

let firebaseBucket = null;
let isFirebaseConfigured = false;

try {
  let serviceAccount = null;
  if (serviceAccountJsonEnv) {
    try {
      const parsedJson = serviceAccountJsonEnv.trim().startsWith('{') 
        ? serviceAccountJsonEnv 
        : Buffer.from(serviceAccountJsonEnv, 'base64').toString('utf8');
      serviceAccount = JSON.parse(parsedJson);
    } catch (e) {
      console.error('Storage Service: Failed to parse FIREBASE_SERVICE_ACCOUNT JSON env:', e.message);
    }
  } else if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
  }

  if (serviceAccount && process.env.FIREBASE_STORAGE_BUCKET) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
    });
    
    firebaseBucket = admin.storage().bucket();
    isFirebaseConfigured = true;
    console.log(`Storage Service: Firebase Storage initialized (Bucket: ${firebaseBucket.name})`);
  }
} catch (error) {
  // Firebase optional
}

// 2. MongoDB GridFS Bucket Helper (Built-in Permanent Cloud Storage via Atlas)
let gridFsBucket = null;

const getGridFsBucket = () => {
  if (!gridFsBucket && mongoose.connection && mongoose.connection.db) {
    gridFsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'documents_storage'
    });
  }
  return gridFsBucket;
};

/**
 * Upload a file buffer to permanent storage (MongoDB GridFS + Local Cache)
 * @param {Buffer} fileBuffer - The file content buffer
 * @param {string} storedName - Unique filename to save under
 * @param {string} mimeType - The file MIME type
 * @returns {Promise<{ fileUrl: string, storageKey: string }>}
 */
const uploadFile = async (fileBuffer, storedName, mimeType) => {
  const storageKey = storedName;

  // Tier 1: Save to MongoDB GridFS (100% Free, Permanent Cloud Storage via Atlas)
  const gfs = getGridFsBucket();
  if (gfs) {
    try {
      await new Promise((resolve, reject) => {
        const uploadStream = gfs.openUploadStream(storedName, {
          contentType: mimeType,
          metadata: { originalMime: mimeType }
        });
        uploadStream.on('error', reject);
        uploadStream.on('finish', resolve);
        uploadStream.end(fileBuffer);
      });
    } catch (gfsErr) {
      console.error('Storage Service: GridFS upload failed:', gfsErr.message);
    }
  }

  // Tier 2: Save to Firebase Storage (if configured)
  if (isFirebaseConfigured && firebaseBucket) {
    try {
      const file = firebaseBucket.file(storedName);
      await file.save(fileBuffer, { metadata: { contentType: mimeType }, resumable: false });
    } catch (fbErr) {
      console.warn('Storage Service: Firebase upload failed:', fbErr.message);
    }
  }

  // Tier 3: Save to local uploads/ cache
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, storedName);
    await fs.promises.writeFile(filePath, fileBuffer);
  } catch (localErr) {
    console.warn('Storage Service: Local cache write failed:', localErr.message);
  }

  const backendUrl = process.env.BACKEND_URL || '';
  const fileUrl = `${backendUrl}/api/documents/view/${storedName}`;

  return { fileUrl, storageKey };
};

/**
 * Retrieve a temporary signed or direct access URL for a stored file
 * @param {string} storageKey - File storage identifier
 * @param {number} expiresIn - Expiration time in seconds
 * @returns {Promise<string>}
 */
const getSignedUrl = async (storageKey, expiresIn = 300) => {
  if (isFirebaseConfigured && firebaseBucket) {
    try {
      const file = firebaseBucket.file(storageKey);
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn * 1000,
      });
      return url;
    } catch (e) {}
  }

  const backendUrl = process.env.BACKEND_URL || '';
  return `${backendUrl}/api/documents/view/${storageKey}`;
};

/**
 * Download file content back into a buffer with multi-tier fallback
 * @param {string} storageKey - File storage identifier
 * @param {string} [fileUrl] - Optional direct URL fallback
 * @returns {Promise<Buffer>}
 */
const getFileBuffer = async (storageKey, fileUrl = null) => {
  // 1. Try local disk cache first
  const filePath = path.join(__dirname, '../../uploads', storageKey);
  if (fs.existsSync(filePath)) {
    return await fs.promises.readFile(filePath);
  }

  // 2. Stream from MongoDB GridFS (Permanent Cloud Storage in Atlas)
  const gfs = getGridFsBucket();
  if (gfs) {
    try {
      const files = await gfs.find({ filename: storageKey }).toArray();
      if (files && files.length > 0) {
        const chunks = [];
        const downloadStream = gfs.openDownloadStreamByName(storageKey);
        
        return await new Promise((resolve, reject) => {
          downloadStream.on('data', (chunk) => chunks.push(chunk));
          downloadStream.on('error', reject);
          downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
        });
      }
    } catch (gridErr) {
      console.warn(`Storage Service: GridFS download failed for ${storageKey}:`, gridErr.message);
    }
  }

  // 3. Fallback to Firebase Storage if configured
  if (isFirebaseConfigured && firebaseBucket) {
    try {
      const file = firebaseBucket.file(storageKey);
      const [exists] = await file.exists();
      if (exists) {
        const [fileContent] = await file.download();
        return fileContent;
      }
    } catch (cloudErr) {
      console.warn(`Storage Service: Firebase download failed for ${storageKey}:`, cloudErr.message);
    }
  }

  // 4. Fallback to external HTTP stream if available
  if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) && !fileUrl.includes('localhost')) {
    try {
      const axios = require('axios');
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer', timeout: 10000 });
      if (response.status === 200 && response.data) {
        return Buffer.from(response.data);
      }
    } catch (httpErr) {
      console.warn(`Storage Service: HTTP fetch failed for ${fileUrl}:`, httpErr.message);
    }
  }

  throw new Error(`Document file '${storageKey}' is no longer on the server. Please upload the document again.`);
};

/**
 * Remove a file from storage across all tiers
 * @param {string} storageKey - File storage identifier
 */
const deleteFile = async (storageKey) => {
  // 1. Delete from local cache
  const filePath = path.join(__dirname, '../../uploads', storageKey);
  if (fs.existsSync(filePath)) {
    try {
      await fs.promises.unlink(filePath);
    } catch (e) {}
  }

  // 2. Delete from MongoDB GridFS
  const gfs = getGridFsBucket();
  if (gfs) {
    try {
      const files = await gfs.find({ filename: storageKey }).toArray();
      for (const f of files) {
        await gfs.delete(f._id);
      }
    } catch (e) {}
  }

  // 3. Delete from Firebase
  if (isFirebaseConfigured && firebaseBucket) {
    try {
      const file = firebaseBucket.file(storageKey);
      await file.delete();
    } catch (e) {}
  }
};

module.exports = {
  uploadFile,
  getSignedUrl,
  getFileBuffer,
  deleteFile,
};
