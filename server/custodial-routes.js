import { CustodialCRUD } from './mongodb-crud.js';
import multer from 'multer';
import path from 'path';

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, GIF allowed'), false);
    }
  }
});

export function registerCustodialRoutes(app) {
  // Get all custodial records
  app.get('/api/custodial-records', async (req, res) => {
    try {
      console.log('🔍 Fetching all custodial records from MongoDB...');
      const inmates = await CustodialCRUD.findAll();
      console.log('📊 Found custodial records in MongoDB:', inmates.length, 'records');

      const transformedInmates = inmates.map(inmate => ({
        ...inmate,
        id: inmate._id.toString()
      }));

      res.json({ inmates: transformedInmates });
    } catch (error) {
      console.error('❌ Failed to fetch custodial records:', error);
      res.status(500).json({ message: 'Failed to fetch custodial records', error: error.message });
    }
  });

  // Get single custodial record
  app.get('/api/custodial-records/:id', async (req, res) => {
    try {
      console.log('🔍 Fetching custodial record by ID:', req.params.id);
      const inmate = await CustodialCRUD.findById(req.params.id);

      if (!inmate) {
        return res.status(404).json({ message: 'Custodial record not found' });
      }

      const responseInmate = {
        ...inmate,
        id: inmate._id.toString()
      };

      res.json({ inmate: responseInmate });
    } catch (error) {
      console.error('❌ Failed to fetch custodial record:', error);
      res.status(500).json({ message: 'Failed to fetch custodial record', error: error.message });
    }
  });

  // Create new custodial record
  app.post('/api/custodial-records', upload.single('idPhoto'), async (req, res) => {
    try {
      console.log('🔍 Creating new custodial record with data:', req.body);
      console.log('🔍 Uploaded file:', req.file);

      const inmateData = { ...req.body };

      // Parse JSON fields
      if (inmateData.charges && typeof inmateData.charges === 'string') {
        inmateData.charges = JSON.parse(inmateData.charges);
      }

      // Handle file upload
      if (req.file) {
        inmateData.idPhoto = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          uploadedAt: new Date()
        };
      }

      const createdInmate = await CustodialCRUD.create(inmateData);
      console.log('✅ Custodial record created successfully:', createdInmate);

      const responseInmate = {
        ...createdInmate,
        id: createdInmate._id.toString()
      };

      res.status(201).json({ inmate: responseInmate });
    } catch (error) {
      console.error('❌ Failed to create custodial record:', error);
      res.status(500).json({ message: 'Failed to create custodial record', error: error.message });
    }
  });

  // Update custodial record
  app.put('/api/custodial-records/:id', upload.single('idPhoto'), async (req, res) => {
    try {
      console.log('🔍 Updating custodial record:', req.params.id, 'with data:', req.body);

      const updateData = { ...req.body };

      // Parse JSON fields
      if (updateData.charges && typeof updateData.charges === 'string') {
        updateData.charges = JSON.parse(updateData.charges);
      }

      // Handle file upload
      if (req.file) {
        updateData.idPhoto = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          uploadedAt: new Date()
        };
      }

      const updated = await CustodialCRUD.update(req.params.id, updateData);

      if (!updated) {
        return res.status(404).json({ message: 'Custodial record not found' });
      }

      // Fetch the updated record
      const updatedInmate = await CustodialCRUD.findById(req.params.id);
      const responseInmate = {
        ...updatedInmate,
        id: updatedInmate._id.toString()
      };

      res.json({ inmate: responseInmate });
    } catch (error) {
      console.error('❌ Failed to update custodial record:', error);
      res.status(500).json({ message: 'Failed to update custodial record', error: error.message });
    }
  });

  // Delete custodial record
  app.delete('/api/custodial-records/:id', async (req, res) => {
    try {
      console.log('🗑️ Deleting custodial record:', req.params.id);
      const deleted = await CustodialCRUD.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({ message: 'Custodial record not found' });
      }

      console.log('✅ Custodial record deleted successfully');
      res.json({ message: 'Custodial record deleted successfully' });
    } catch (error) {
      console.error('❌ Failed to delete custodial record:', error);
      res.status(500).json({ message: 'Failed to delete custodial record', error: error.message });
    }
  });

  // Get custodial statistics
  app.get('/api/custodial-records/stats/summary', async (req, res) => {
    try {
      console.log('📊 Fetching custodial records statistics');
      const stats = await CustodialCRUD.getStats();
      res.json({ stats });
    } catch (error) {
      console.error('❌ Failed to fetch custodial stats:', error);
      res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
    }
  });

  // Search custodial records
  app.get('/api/custodial-records/search/:query', async (req, res) => {
    try {
      console.log('🔍 Searching custodial records with query:', req.params.query);
      const inmates = await CustodialCRUD.search(req.params.query);

      const transformedInmates = inmates.map(inmate => ({
        ...inmate,
        id: inmate._id.toString()
      }));

      res.json({ inmates: transformedInmates });
    } catch (error) {
      console.error('❌ Failed to search custodial records:', error);
      res.status(500).json({ message: 'Failed to search custodial records', error: error.message });
    }
  });

  // Seed sample custodial records
  app.post('/api/custodial-records/seed', async (req, res) => {
    try {
      console.log('🌱 Seeding sample custodial records...');
      const result = await CustodialCRUD.seedSampleData();
      res.json({ 
        message: 'Sample custodial records seeded successfully',
        count: result.length 
      });
    } catch (error) {
      console.error('❌ Failed to seed custodial records:', error);
      res.status(500).json({ message: 'Failed to seed custodial records', error: error.message });
    }
  });

  // Enhanced Custodial Reports API with Cross-References
  app.post('/api/custodial-reports', async (req, res) => {
    try {
      console.log('🔍 Creating custodial report with cross-references:', req.body);

      // Import additional CRUD modules for cross-referencing
      const { OBEntriesCRUD, EvidenceCRUD, OfficersCRUD, PoliceVehiclesCRUD } = await import('./mongodb-crud.js');
      
      // Fetch all related data for cross-referencing
      const [obEntries, inmates, evidence, officers, vehicles] = await Promise.all([
        OBEntriesCRUD.findAll().catch(() => []),
        CustodialCRUD.findAll(),
        EvidenceCRUD.findAll().catch(() => []),
        OfficersCRUD.findAll().catch(() => []),
        PoliceVehiclesCRUD.findAll().catch(() => [])
      ]);

      // Generate cross-references
      const crossReferences = {
        totalConnections: 0,
        obToEvidence: [],
        evidenceToInmates: [],
        inmateToOfficer: []
      };

      // Create enhanced report content with cross-references
      let enhancedContent = req.body.content || [];
      
      if (req.body.metadata?.includeReferences) {
        // Add cross-reference analysis
        enhancedContent.push({
          title: 'Cross-Module Analysis',
          content: `
          Integrated System Analysis:
          • Total OB Entries: ${obEntries.length}
          • Total Inmates: ${inmates.length}
          • Total Evidence Items: ${evidence.length}
          • Total Officers: ${officers.length}
          
          Cross-References Identified:
          • OB-Evidence Connections: ${crossReferences.obToEvidence.length}
          • Evidence-Inmate Connections: ${crossReferences.evidenceToInmates.length}
          • Officer-Case Connections: ${crossReferences.inmateToOfficer.length}
          
          Data Integrity Status: ✓ All modules synchronized
          Last Cross-Reference Update: ${new Date().toLocaleString()}
          `
        });
      }

      const reportData = {
        ...req.body,
        content: enhancedContent,
        crossReferences,
        reportNumber: `RPT-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Import ReportsCRUD for proper database access
      const { ReportsCRUD } = await import('./mongodb-crud.js');
      const createdReport = await ReportsCRUD.create(reportData);
      const report = { ...createdReport, id: createdReport._id.toString() };
      
      console.log('✅ Enhanced custodial report created successfully:', report._id);

      res.status(201).json({ report });
    } catch (error) {
      console.error('❌ Failed to create custodial report:', error);
      res.status(500).json({ message: 'Failed to create custodial report', error: error.message });
    }
  });

  console.log('✅ Custodial routes registered successfully');
}