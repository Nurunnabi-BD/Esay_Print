const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const pdfParse = require('pdf-parse');
const Document = require('../models/Document');
const { getFileBuffer, uploadFile, deleteFile } = require('./storageService');

const execPromise = util.promisify(exec);

/**
 * Check if LibreOffice is installed and available in the PATH
 * @returns {Promise<boolean>}
 */
const checkLibreOffice = async () => {
  try {
    const cmd = os.platform() === 'win32' ? 'where soffice' : 'which soffice';
    await execPromise(cmd);
    return true;
  } catch (error) {
    // If command fails, check standard Windows path for LibreOffice
    if (os.platform() === 'win32') {
      const standardPaths = [
        '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"',
        '"C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe"'
      ];
      for (const p of standardPaths) {
        try {
          await execPromise(`${p} --version`);
          return true;
        } catch (e) {
          // ignore and check next
        }
      }
    }
    return false;
  }
};

/**
 * Get the LibreOffice execution command based on platform
 */
const getSofficeCommand = async () => {
  if (os.platform() === 'win32') {
    // Check standard Windows paths first
    const standardPaths = [
      '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"',
      '"C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe"'
    ];
    for (const p of standardPaths) {
      try {
        await execPromise(`${p} --version`);
        return p;
      } catch (e) {
        // ignore
      }
    }
  }
  return 'soffice'; // Default command for Linux/Render or if it's on Windows PATH
};

/**
 * Background document processing task
 * @param {string} docId - MongoDB Document ID
 */
const processDocument = async (docId) => {
  let doc;
  try {
    doc = await Document.findById(docId);
    if (!doc) {
      console.error(`Document processor error: Document with ID ${docId} not found.`);
      return;
    }

    // Update status to processing
    doc.processingStatus = 'processing';
    await doc.save();

    console.log(`Document processor: Starting processing for file: ${doc.originalName} (${doc.extension})`);

    // Fetch the file buffer from storage
    const fileBuffer = await getFileBuffer(doc.storageKey);
    let finalPageCount = 1;

    // Process depending on extension
    if (doc.extension === '.pdf') {
      // 1. Direct PDF parsing
      const pdfData = await pdfParse(fileBuffer);
      finalPageCount = pdfData.numpages || 1;
      console.log(`Document processor: PDF page count parsed successfully: ${finalPageCount}`);
    } 
    else if (['.png', '.jpg', '.jpeg', '.webp'].includes(doc.extension)) {
      // 2. Images treat as 1 page
      finalPageCount = 1;
      console.log(`Document processor: Image file set to 1 page.`);
    } 
    else if (doc.extension === '.txt') {
      // 3. Text files: estimate based on characters (roughly 3000 chars per page)
      const textContent = fileBuffer.toString('utf-8');
      finalPageCount = Math.max(1, Math.ceil(textContent.length / 3000));
      console.log(`Document processor: Text file page count estimated: ${finalPageCount}`);
    } 
    else if (['.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt'].includes(doc.extension)) {
      // 4. Office documents: convert to PDF using LibreOffice
      const loAvailable = await checkLibreOffice();
      
      if (loAvailable) {
        console.log('Document processor: LibreOffice detected. Converting file to PDF...');
        
        // Setup temporary directories inside workspace
        const tempDir = path.join(__dirname, '../../uploads/temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        const tempInputPath = path.join(tempDir, doc.storedName);
        await fs.promises.writeFile(tempInputPath, fileBuffer);

        const sofficeCmd = await getSofficeCommand();
        const conversionCommand = `${sofficeCmd} --headless --convert-to pdf --outdir "${tempDir}" "${tempInputPath}"`;
        
        // Execute conversion command
        await execPromise(conversionCommand);

        // Converted file will have the same name but with .pdf extension
        const baseName = path.basename(doc.storedName, doc.extension);
        const tempPdfPath = path.join(tempDir, `${baseName}.pdf`);

        if (fs.existsSync(tempPdfPath)) {
          // Read converted PDF buffer
          const convertedBuffer = await fs.promises.readFile(tempPdfPath);
          
          // Upload converted PDF to storage
          const convertedStoredName = `${baseName}-converted.pdf`;
          const uploadRes = await uploadFile(convertedBuffer, convertedStoredName, 'application/pdf');

          // Save converted PDF details in doc schema
          doc.convertedFileUrl = uploadRes.fileUrl;
          doc.convertedStorageKey = uploadRes.storageKey;

          // Parse converted PDF to get actual page count
          const pdfData = await pdfParse(convertedBuffer);
          finalPageCount = pdfData.numpages || 1;

          // Cleanup temp local files
          await fs.promises.unlink(tempInputPath);
          await fs.promises.unlink(tempPdfPath);
          
          console.log(`Document processor: Conversion successful. Parsed page count: ${finalPageCount}`);
        } else {
          throw new Error('Converted PDF file not found on disk after conversion command.');
        }
      } else {
        // Fallback mock estimate if LibreOffice is missing (e.g. standard developer laptop)
        console.warn('Document processor: LibreOffice is NOT installed on this machine. Graceful fallback to estimation.');
        if (['.docx', '.doc'].includes(doc.extension)) {
          finalPageCount = 3; // Estimated default
        } else if (['.pptx', '.ppt'].includes(doc.extension)) {
          finalPageCount = 8; // Estimated default
        } else {
          finalPageCount = 1; // Default for spreadsheets
        }
        doc.errorMessage = 'LibreOffice not available on server; page count estimated.';
      }
    }

    // Save final page count and mark as processed
    doc.pageCount = finalPageCount;
    doc.processingStatus = 'processed';
    await doc.save();
    console.log(`Document processor: Completed processing doc ID: ${doc._id}. Status: processed.`);

    // Realtime notification
    try {
      const { emitDocumentProcessed } = require('./socketService');
      emitDocumentProcessed(doc._id, doc.userId, 'processed', finalPageCount);
    } catch (err) {
      console.warn('Realtime notify failed during doc processing:', err.message);
    }

  } catch (error) {
    console.error(`Document processor error on doc ID ${docId}:`, error.message);
    if (doc) {
      doc.processingStatus = 'failed';
      doc.errorMessage = error.message;
      await doc.save();
      try {
        const { emitDocumentProcessed } = require('./socketService');
        emitDocumentProcessed(doc._id, doc.userId, 'failed', 0);
      } catch (err) {
        // ignore
      }
    }
  }
};

module.exports = {
  processDocument,
};
