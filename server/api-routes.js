
import { Evidence } from './mongodb-models.js';
import multer from 'multer';
import { GridFSBucket } from 'mongodb';
import { getDatabase } from './mongodb-connection.js';
import path from 'path';
import fs from 'fs';

export function registerAdditionalRoutes(app) {
  console.log('🔧 Registering additional API routes...');

  // Configure multer for file storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = './uploads';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|pdf|doc|docx/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only images, videos, and documents are allowed'));
      }
    }
  });

  // Media upload endpoint for evidence
  app.post('/api/upload-media', upload.array('media'), async (req, res) => {
    try {
      console.log('🔍 Uploading media files:', req.files?.length || 0, 'files');

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const uploadedFiles = [];

      for (const file of req.files) {
        const mediaFile = {
          name: file.originalname,
          filename: file.filename,
          url: `/uploads/${file.filename}`,
          type: file.mimetype.startsWith('image/') ? 'photo' : 
                file.mimetype.startsWith('video/') ? 'video' :
                file.mimetype.startsWith('audio/') ? 'audio' : 'document',
          size: file.size,
          uploadedAt: new Date(),
          uploadedBy: 'Current User' // TODO: Get from session
        };
        
        uploadedFiles.push(mediaFile);
        console.log('✅ File uploaded:', mediaFile.filename);
      }

      res.json({ 
        success: true, 
        files: uploadedFiles,
        message: `${uploadedFiles.length} file(s) uploaded successfully`
      });
    } catch (error) {
      console.error('❌ Media upload error:', error);
      res.status(500).json({ error: error.message || 'Failed to upload media' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  console.log('✅ Additional API routes registered successfully');
}
