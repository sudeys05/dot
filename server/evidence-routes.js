import { EvidenceCRUD } from './mongodb-crud.js';
import { ObjectId } from 'mongodb';

export function registerEvidenceRoutes(app) {
  console.log('🔧 Registering Evidence Routes...');

  // Get all evidence
  app.get('/api/evidence', async (req, res) => {
    try {
      console.log('🔍 API: Fetching all evidence');
      const evidence = await EvidenceCRUD.findAll();

      // Transform data for frontend
      const transformedEvidence = evidence.map(item => ({
        id: item._id.toString(),
        evidenceNumber: item.evidenceNumber,
        type: item.type,
        description: item.description,
        location: item.location,
        chain_of_custody: item.chain_of_custody,
        status: item.status,
        collectedAt: item.collectedAt,
        collectedBy: item.collectedBy || 'Unknown Officer',
        caseId: item.caseId,
        obId: item.obId,
        media: item.media || [],
        custodyLog: item.custodyLog || [],
        tags: item.tags || [],
        weight: item.weight,
        dimensions: item.dimensions,
        serialNumber: item.serialNumber,
        condition: item.condition,
        storageLocation: item.storageLocation,
        evidenceRoom: item.evidenceRoom,
        priority: item.priority,
        isSealed: item.isSealed,
        bagsSealed: item.bagsSealed,
        photographed: item.photographed,
        fingerprinted: item.fingerprinted,
        dnaCollected: item.dnaCollected,
        notes: item.notes,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));

      console.log('✅ API: Sending evidence data:', transformedEvidence.length, 'items');
      res.json({ evidence: transformedEvidence });
    } catch (error) {
      console.error('❌ API: Error fetching evidence:', error);
      res.status(500).json({ error: 'Failed to fetch evidence' });
    }
  });

  // Get evidence by ID
  app.get('/api/evidence/:id', async (req, res) => {
    try {
      console.log('🔍 API: Fetching evidence by ID:', req.params.id);
      const evidence = await EvidenceCRUD.findById(req.params.id);

      if (!evidence) {
        return res.status(404).json({ error: 'Evidence not found' });
      }

      const transformedEvidence = {
        id: evidence._id.toString(),
        ...evidence
      };

      res.json({ evidence: transformedEvidence });
    } catch (error) {
      console.error('❌ API: Error fetching evidence by ID:', error);
      res.status(500).json({ error: 'Failed to fetch evidence' });
    }
  });

  // Create new evidence
  app.post('/api/evidence', async (req, res) => {
    try {
      console.log('🔍 API: Creating new evidence with data:', req.body);

      // Add default collectedBy if not provided
      const evidenceData = {
        ...req.body,
        collectedBy: req.body.collectedBy || 'Unknown Officer'
      };

      // Validate required fields
      const { type, description, location } = evidenceData;
      if (!type || !description || !location) {
        return res.status(400).json({ 
          error: 'Missing required fields: type, description, location' 
        });
      }

      const evidence = await EvidenceCRUD.create(evidenceData);

      const transformedEvidence = {
        id: evidence._id.toString(),
        ...evidence
      };

      console.log('✅ API: Evidence created successfully');
      res.status(201).json({ 
        success: true, 
        evidence: transformedEvidence,
        message: 'Evidence created successfully'
      });
    } catch (error) {
      console.error('❌ API: Error creating evidence:', error);
      if (error.code === 11000) {
        res.status(409).json({ error: 'Evidence number already exists' });
      } else {
        res.status(500).json({ error: 'Failed to create evidence' });
      }
    }
  });

  // Update evidence
  app.put('/api/evidence/:id', async (req, res) => {
    try {
      console.log('🔍 API: Updating evidence:', req.params.id);
      const success = await EvidenceCRUD.update(req.params.id, req.body);

      if (!success) {
        return res.status(404).json({ error: 'Evidence not found' });
      }

      const updatedEvidence = await EvidenceCRUD.findById(req.params.id);
      const transformedEvidence = {
        id: updatedEvidence._id.toString(),
        ...updatedEvidence
      };

      console.log('✅ API: Evidence updated successfully');
      res.json({ 
        success: true, 
        evidence: transformedEvidence,
        message: 'Evidence updated successfully'
      });
    } catch (error) {
      console.error('❌ API: Error updating evidence:', error);
      res.status(500).json({ error: 'Failed to update evidence' });
    }
  });

  // Add custody log entry
  app.post('/api/evidence/:id/custody', async (req, res) => {
    try {
      console.log('🔍 API: Adding custody entry to evidence:', req.params.id);
      const { action, officer, notes, location } = req.body;

      if (!action || !officer) {
        return res.status(400).json({ 
          error: 'Missing required fields: action, officer' 
        });
      }

      const custodyEntry = {
        action,
        officer,
        notes: notes || '',
        location: location || '',
        timestamp: new Date()
      };

      const success = await EvidenceCRUD.addCustodyEntry(req.params.id, custodyEntry);

      if (!success) {
        return res.status(404).json({ error: 'Evidence not found' });
      }

      console.log('✅ API: Custody entry added successfully');
      res.json({ 
        success: true,
        message: 'Custody entry added successfully'
      });
    } catch (error) {
      console.error('❌ API: Error adding custody entry:', error);
      res.status(500).json({ error: 'Failed to add custody entry' });
    }
  });

  // Add media to evidence
  app.post('/api/evidence/:id/media', async (req, res) => {
    try {
      console.log('🔍 API: Adding media to evidence:', req.params.id);
      const { name, url, type, uploadedBy } = req.body;

      if (!name || !url || !type) {
        return res.status(400).json({ 
          error: 'Missing required fields: name, url, type' 
        });
      }

      const mediaFile = {
        name,
        url,
        type,
        uploadedBy: uploadedBy || 'Unknown',
        uploadedAt: new Date()
      };

      const success = await EvidenceCRUD.addMedia(req.params.id, mediaFile);

      if (!success) {
        return res.status(404).json({ error: 'Evidence not found' });
      }

      console.log('✅ API: Media added successfully');
      res.json({ 
        success: true,
        message: 'Media added successfully'
      });
    } catch (error) {
      console.error('❌ API: Error adding media:', error);
      res.status(500).json({ error: 'Failed to add media' });
    }
  });

  // Get evidence by case ID
  app.get('/api/evidence/case/:caseId', async (req, res) => {
    try {
      console.log('🔍 API: Fetching evidence by case ID:', req.params.caseId);
      const evidence = await EvidenceCRUD.findByCaseId(req.params.caseId);

      const transformedEvidence = evidence.map(item => ({
        id: item._id.toString(),
        ...item
      }));

      res.json({ evidence: transformedEvidence });
    } catch (error) {
      console.error('❌ API: Error fetching evidence by case ID:', error);
      res.status(500).json({ error: 'Failed to fetch evidence' });
    }
  });

  // Get evidence by OB ID
  app.get('/api/evidence/ob/:obId', async (req, res) => {
    try {
      console.log('🔍 API: Fetching evidence by OB ID:', req.params.obId);
      const evidence = await EvidenceCRUD.findByOBId(req.params.obId);

      const transformedEvidence = evidence.map(item => ({
        id: item._id.toString(),
        ...item
      }));

      res.json({ evidence: transformedEvidence });
    } catch (error) {
      console.error('❌ API: Error fetching evidence by OB ID:', error);
      res.status(500).json({ error: 'Failed to fetch evidence' });
    }
  });

  // Get evidence statistics
  app.get('/api/evidence/stats', async (req, res) => {
    try {
      console.log('🔍 API: Fetching evidence statistics');
      const stats = await EvidenceCRUD.getEvidenceStats();
      res.json({ stats });
    } catch (error) {
      console.error('❌ API: Error fetching evidence statistics:', error);
      res.status(500).json({ error: 'Failed to fetch evidence statistics' });
    }
  });

  // Delete evidence
  app.delete('/api/evidence/:id', async (req, res) => {
    try {
      console.log('🔍 API: Deleting evidence:', req.params.id);
      const success = await EvidenceCRUD.delete(req.params.id);

      if (!success) {
        return res.status(404).json({ error: 'Evidence not found' });
      }

      console.log('✅ API: Evidence deleted successfully');
      res.json({ 
        success: true,
        message: 'Evidence deleted successfully'
      });
    } catch (error) {
      console.error('❌ API: Error deleting evidence:', error);
      res.status(500).json({ error: 'Failed to delete evidence' });
    }
  });

  console.log('✅ Evidence Routes registered successfully');
}