const crypto = require('crypto');
const path = require('path');
const Document = require('../models/Document');
const { uploadFile, getSignedUrl, deleteFile } = require('../services/storageService');

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please upload a file' 
      });
    }

    const file = req.file;
    const originalName = file.originalname;
    const extension = path.extname(originalName).toLowerCase();
    const mimeType = file.mimetype;
    const fileSize = file.size;

    // Generate unique stored filename using random UUID
    const uuid = crypto.randomUUID();
    const storedName = `${uuid}${extension}`;

    // Upload to local storage or Supabase bucket
    const { fileUrl, storageKey } = await uploadFile(file.buffer, storedName, mimeType);

    // Save record in MongoDB with pending status
    const doc = await Document.create({
      userId: req.user.id,
      originalName,
      storedName,
      extension,
      mimeType,
      fileSize,
      fileUrl,
      storageKey,
      processingStatus: 'pending'
    });

    // Send immediate response
    res.status(201).json({
      success: true,
      document: {
        _id: doc._id,
        originalName: doc.originalName,
        extension: doc.extension,
        fileSize: doc.fileSize,
        fileUrl: doc.fileUrl,
        processingStatus: doc.processingStatus,
        pageCount: doc.pageCount
      }
    });

    // Start background file processing/page counting (Phase 5)
    setTimeout(async () => {
      try {
        const { processDocument } = require('../services/docProcessorService');
        await processDocument(doc._id);
      } catch (err) {
        console.error(`Background processing trigger failed for doc ${doc._id}:`, err.message);
      }
    }, 0);

  } catch (error) {
    console.error('File upload controller error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'File upload processing failed' 
    });
  }
};

// @desc    Get document details
// @route   GET /api/documents/:id
// @access  Private
const getDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    // Owner authorization audit
    if (doc.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this document' 
      });
    }

    // Fetch dynamic secure signed URL
    const signedUrl = await getSignedUrl(doc.storageKey);

    return res.json({
      success: true,
      document: {
        _id: doc._id,
        originalName: doc.originalName,
        extension: doc.extension,
        fileSize: doc.fileSize,
        fileUrl: signedUrl,
        convertedFileUrl: doc.convertedStorageKey ? await getSignedUrl(doc.convertedStorageKey) : null,
        processingStatus: doc.processingStatus,
        pageCount: doc.pageCount,
        createdAt: doc.createdAt
      }
    });
  } catch (error) {
    console.error('Get document details error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving document details' 
    });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    // Owner authorization audit
    if (doc.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this document' 
      });
    }

    // Unlink storage objects
    await deleteFile(doc.storageKey);
    if (doc.convertedStorageKey) {
      await deleteFile(doc.convertedStorageKey);
    }

    // Delete database entry
    await doc.deleteOne();

    return res.json({ 
      success: true, 
      message: 'Document deleted successfully' 
    });
  } catch (error) {
    console.error('Delete document error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error deleting document' 
    });
  }
};

// @desc    Download document (original binary or converted PDF)
// @route   GET /api/documents/:id/download
// @access  Private
const downloadDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    // Owner authorization check
    const docUserId = doc.userId?._id ? doc.userId._id.toString() : doc.userId?.toString();
    const reqUserId = req.user?._id ? req.user._id.toString() : (req.user?.id || '');
    if (docUserId && docUserId !== reqUserId && req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to download this document' 
      });
    }

    const { getFileBuffer } = require('../services/storageService');
    const isConverted = req.query.type === 'converted' && doc.convertedStorageKey;
    const targetKey = isConverted ? doc.convertedStorageKey : doc.storageKey;
    const targetName = isConverted 
      ? `${path.basename(doc.originalName, doc.extension)}.pdf`
      : doc.originalName;
    const targetMime = isConverted ? 'application/pdf' : (doc.mimeType || 'application/octet-stream');

    const fileBuffer = await getFileBuffer(targetKey, doc.fileUrl);

    res.setHeader('Content-Type', targetMime);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(targetName)}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    return res.send(fileBuffer);
  } catch (error) {
    console.error('Download document error:', error.message);
    return res.status(404).json({ 
      success: false, 
      message: error.message || 'Server error downloading document' 
    });
  }
};

// @desc    Stream/view document inline
// @route   GET /api/documents/:id/view
// @access  Private
const viewDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    const { getFileBuffer } = require('../services/storageService');
    const isConverted = req.query.type === 'converted' && doc.convertedStorageKey;
    const targetKey = isConverted ? doc.convertedStorageKey : doc.storageKey;
    const targetName = isConverted 
      ? `${path.basename(doc.originalName, doc.extension)}.pdf`
      : doc.originalName;
    const targetMime = isConverted ? 'application/pdf' : (doc.mimeType || 'application/octet-stream');

    const fileBuffer = await getFileBuffer(targetKey, doc.fileUrl);

    res.setHeader('Content-Type', targetMime);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(targetName)}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    return res.send(fileBuffer);
  } catch (error) {
    console.error('View document error:', error.message);
    return res.status(404).json({ 
      success: false, 
      message: error.message || 'Server error viewing document' 
    });
  }
};

module.exports = { 
  uploadDocument, 
  getDocument, 
  deleteDocument,
  downloadDocument,
  viewDocument
};
