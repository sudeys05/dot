import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { connectToMongoDB } from './mongodb-connection.js'; // Ensure this is correct after transpilation
import { registerMongoDBRoutes } from './mongodb-routes.js';
import { registerEvidenceRoutes } from './evidence-routes.js';
import { registerCustodialRoutes } from './custodial-routes.js';
import { setupVite, serveStatic, log } from './vite.js';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { seedGeofiles } from './seed-geofiles.js';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

// Resolve path for __dirname (in ESM modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Helper function to mask MongoDB URI in logs
function maskMongoUri(uri: string | undefined): string {
  if (!uri) return "[NOT SET]";
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
}

console.log("Starting Police Management System with MongoDB Atlas...");
console.log(`MONGODB_URI = ${maskMongoUri(process.env.MONGODB_URI)}`);

// Check if MongoDB URI is set
if (!process.env.MONGODB_URI) {
  console.warn('⚠️ MONGODB_URI environment variable is not set');
  console.log('🔄 Starting server in fallback mode without database...');
}

const app = express();
const server = createServer(app);

// Configure multer for geofile uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.shp', '.kml', '.geojson', '.csv', '.gpx', '.kmz', '.gml'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Configure multer for custodial records (ID photos)
const uploadCustodial = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for photos
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedImageTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image file type. Only JPG, PNG, JPEG allowed'), false);
    }
  }
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'police-management-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoStatus = process.env.MONGODB_URI ? 'connected' : 'disconnected';
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoStatus,
    message: mongoStatus === 'connected' ? 'All systems operational' : 'Running in fallback mode - update MongoDB URI in .env'
  });
});

async function startServer() {
  let mongoConnected = false;

  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await connectToMongoDB();
    console.log('✅ MongoDB connected successfully!');
    mongoConnected = true;
  } catch (error) {
    console.warn('⚠️ MongoDB connection failed:', error.message);
    console.log('🔄 Starting server in fallback mode without database...');
    console.log('📝 Update your .env file with proper MongoDB credentials to enable full functionality');
  }

  try {
    // Register routes (even without MongoDB for basic functionality)
    if (mongoConnected) {
      registerMongoDBRoutes(app, upload, uploadCustodial);
      console.log('✅ MongoDB Routes registered successfully');
    }

    // Register Evidence Routes
    console.log('🔧 Registering Evidence Routes...');
    registerEvidenceRoutes(app, upload);
    console.log('✅ Evidence Routes registered successfully');

    // Register Custodial Routes
    console.log('🔧 Registering Custodial Routes...');
    registerCustodialRoutes(app);
    console.log('✅ Custodial Routes registered successfully');

    // Import and register additional routes (optional)
    try {
      const additionalRoutes = await import('./api-routes.js');
      if (additionalRoutes && additionalRoutes.registerAdditionalRoutes) {
        additionalRoutes.registerAdditionalRoutes(app);
        console.log('✅ Additional routes loaded successfully');
      }
    } catch (error) {
      console.log('⚠️  Additional routes file not found - continuing without it');
    }

    // Serve uploaded files statically
    app.use('/uploads', express.static('uploads'));

    // Static files for React build (production)
    if (process.env.NODE_ENV === 'production') {
      const buildPath = path.join(__dirname, '../dist/public');
      app.use(express.static(buildPath));

      // Handle React Router - send all non-API requests to index.html
      app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
          res.sendFile(path.join(buildPath, 'index.html'));
        }
      });
    } else {
      await setupVite(app, server);
    }

    // Seed development data (only if MongoDB is connected)
    if (mongoConnected) {
      try {
        // Import and initialize seeding functions
        console.log('🌱 Seeding sample geofiles...');
        const { seedGeofiles } = await import('./seed-geofiles.js');
        await seedGeofiles();

        // Seed admin user for login
        console.log('🌱 Seeding admin user...');
        const { seedAdminUser } = await import('./seed-admin.js');
        await seedAdminUser();
      } catch (error) {
        console.warn('⚠️ Failed to seed data:', error.message);
      }
    }

    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen(port, '0.0.0.0', () => {
      log(`Police Management System running on port ${port}`);
      log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      log(`MongoDB Status: ${mongoConnected ? 'Connected' : 'Disconnected (Fallback Mode)'}`);
      log(`Server accessible at: http://0.0.0.0:${port}`);
      console.log(`🌐 Server is ready and listening on http://0.0.0.0:${port}`);
      console.log(`📱 Replit webview should be accessible now`);

      if (!mongoConnected) {
        console.log(`⚠️  Note: Running without database. Update MONGODB_URI in .env to enable full functionality`);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
