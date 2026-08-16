const express = require('express');
const router = express.Router();
const { 
  uploadDocument, 
  getDocument, 
  deleteDocument,
  downloadDocument,
  viewDocument 
} = require('../controllers/docController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Custom upload middleware to accept 'file', 'document', or any single upload field
const handleSingleUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};

router.post('/upload', protect, handleSingleUpload, uploadDocument);
router.get('/:id/download', protect, downloadDocument);
router.get('/:id/view', protect, viewDocument);
router.route('/:id')
  .get(protect, getDocument)
  .delete(protect, deleteDocument);

module.exports = router;
