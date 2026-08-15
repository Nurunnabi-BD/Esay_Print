const multer = require('multer');
const path = require('path');

// Configure memory storage (keep file buffer in RAM)
const storage = multer.memoryStorage();

// Supported file extensions
const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc', '.docx',
  '.xls', '.xlsx',
  '.ppt', '.pptx',
  '.txt',
  '.jpg', '.jpeg', '.png', '.webp'
];

// Allowed MIME types mapping to double check compatibility
const ALLOWED_MIME_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'text/plain': '.txt',
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/jpg': ['.jpg', '.jpeg'],
  'image/pjpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/x-png': ['.png'],
  'image/webp': ['.webp']
};

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  // 1. Validate file extension
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new Error(`Unsupported file extension. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`), 
      false
    );
  }

  // 2. Validate MIME type
  const expectedExt = ALLOWED_MIME_TYPES[mimeType];
  if (!expectedExt) {
    // If mimeType isn't strict in dictionary but extension is valid, allow common image/document fallback
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(null, true);
    }
    return cb(
      new Error(`Unsupported file content type (MIME): ${mimeType}`), 
      false
    );
  }

  // 3. Prevent MIME spoofing (ensure ext matches MIME structure)
  if (Array.isArray(expectedExt)) {
    if (!expectedExt.includes(ext)) {
      return cb(new Error('Extension and content type mismatch.'), false);
    }
  } else if (expectedExt !== ext) {
    return cb(new Error('Extension and content type mismatch.'), false);
  }

  cb(null, true);
};

// Size limit in bytes (config in MB, defaults to 100MB)
const maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 100;
const limits = {
  fileSize: maxFileSizeMB * 1024 * 1024,
};

const upload = multer({
  storage,
  fileFilter,
  limits
});

module.exports = upload;
