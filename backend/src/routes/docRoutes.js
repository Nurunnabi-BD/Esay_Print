const express = require('express');
const router = express.Router();
const { uploadDocument, getDocument, deleteDocument } = require('../controllers/docController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', protect, upload.single('file'), uploadDocument);
router.route('/:id')
  .get(protect, getDocument)
  .delete(protect, deleteDocument);

module.exports = router;
