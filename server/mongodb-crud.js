// MongoDB CRUD operations for Police Management System
import { getDatabase } from './mongodb-connection.js';
import { ObjectId } from 'mongodb';

// Users Collection CRUD
export const UsersCRUD = {
  async create(userData) {
    const db = getDatabase();
    const result = await db.collection('users').insertOne({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { ...userData, _id: result.insertedId };
  },

  async findById(id) {
    const db = getDatabase();
    return await db.collection('users').findOne({ _id: new ObjectId(id) });
  },

  async findByUsername(username) {
    const db = getDatabase();
    return await db.collection('users').findOne({ username });
  },

  async findByEmail(email) {
    const db = getDatabase();
    return await db.collection('users').findOne({ email });
  },

  async findOne(query) {
    const db = getDatabase();
    return await db.collection('users').findOne(query);
  },

  async findAll() {
    const db = getDatabase();
    return await db.collection('users').find({}).toArray();
  },

  async update(id, updateData) {
    const db = getDatabase();
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  },

  async delete(id) {
    const db = getDatabase();
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
};

// Occurrence Book (OB) Entries CRUD
export const OBEntriesCRUD = {
  async create(obData) {
    console.log('🔍 Creating OB entry in MongoDB with data:', obData);
    const db = getDatabase();
    const docToInsert = {
      ...obData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('📝 Document to insert:', docToInsert);

    const result = await db.collection('ob_entries').insertOne(docToInsert);
    console.log('✅ Insert result:', { insertedId: result.insertedId, acknowledged: result.acknowledged });

    // Return the actual document from database
    const insertedDoc = await db.collection('ob_entries').findOne({ _id: result.insertedId });
    console.log('📄 Retrieved inserted OB document:', insertedDoc);

    return insertedDoc;
  },

  async findById(id) {
    const db = getDatabase();
    return await db.collection('ob_entries').findOne({ _id: new ObjectId(id) });
  },

  async findAll() {
    console.log('🔍 Fetching all OB entries from MongoDB');
    const db = getDatabase();
    const obEntries = await db.collection('ob_entries').find({}).sort({ createdAt: -1 }).toArray();
    console.log('📊 Found OB entries in MongoDB:', obEntries.length, 'records');
    return obEntries;
  },

  async findByDateRange(startDate, endDate) {
    const db = getDatabase();
    return await db.collection('ob_entries').find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).toArray();
  },

  async update(id, updateData) {
    const db = getDatabase();
    const result = await db.collection('ob_entries').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  },

  async delete(id) {
    const db = getDatabase();
    const result = await db.collection('ob_entries').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
};

// License Plates CRUD
export const LicensePlatesCRUD = {
  async create(plateData) {
    console.log('🔍 Creating license plate with data:', plateData);
    const db = getDatabase();
    const docToInsert = {
      ...plateData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('📝 Document to insert:', docToInsert);

    const result = await db.collection('license_plates').insertOne(docToInsert);
    console.log('✅ Insert result:', { insertedId: result.insertedId, acknowledged: result.acknowledged });

    // Return the actual document from database
    const insertedDoc = await db.collection('license_plates').findOne({ _id: result.insertedId });
    console.log('📄 Retrieved inserted document:', insertedDoc);

    return {
      ...insertedDoc,
      id: insertedDoc._id.toString()
    };
  },

  async findById(id) {
    const db = getDatabase();
    return await db.collection('license_plates').findOne({ _id: new ObjectId(id) });
  },

  async findByPlateNumber(plateNumber) {
    const db = getDatabase();
    return await db.collection('license_plates').findOne({ plateNumber });
  },

  async findAll() {
    console.log('🔍 Fetching all license plates from MongoDB');
    const db = getDatabase();
    const plates = await db.collection('license_plates').find({}).sort({ createdAt: -1 }).toArray();
    console.log('📊 Found license plates in MongoDB:', plates.length, 'records');
    console.log('📄 Raw plates data:', plates);

    const mappedPlates = plates.map(plate => ({
      ...plate,
      id: plate._id.toString()
    }));
    console.log('🔄 Mapped plates data:', mappedPlates);

    return mappedPlates;
  },

  async findByStatus(status) {
    const db = getDatabase();
    return await db.collection('license_plates').find({ status }).toArray();
  },

  async update(id, updateData) {
    const db = getDatabase();
    const result = await db.collection('license_plates').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  },

  async delete(id) {
    const db = getDatabase();
    const result = await db.collection('license_plates').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
};

// Evidence CRUD
export const EvidenceCRUD = {
  async create(evidenceData) {
    console.log('🔍 Creating evidence in MongoDB with data:', evidenceData);
    const db = getDatabase();

    // Generate evidence number if not provided
    const evidenceNumber = evidenceData.evidenceNumber || `EVD-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    // Initialize chain of custody log
    const initialCustodyEntry = {
      action: 'collected',
      officer: evidenceData.collectedBy || 'Unknown Officer',
      timestamp: new Date(),
      notes: 'Initial evidence collection',
      location: evidenceData.location || 'Unknown Location'
    };

    const docToInsert = {
      ...evidenceData,
      evidenceNumber,
      custodyLog: [initialCustodyEntry],
      media: evidenceData.media || [],
      tags: evidenceData.tags || [],
      priority: evidenceData.priority || 'Medium',
      condition: evidenceData.condition || 'Good',
      isSealed: evidenceData.isSealed || false,
      bagsSealed: evidenceData.bagsSealed || false,
      photographed: evidenceData.photographed || false,
      fingerprinted: evidenceData.fingerprinted || false,
      dnaCollected: evidenceData.dnaCollected || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('📝 Evidence document to insert:', docToInsert);

    const result = await db.collection('evidence').insertOne(docToInsert);
    console.log('✅ Evidence insert result:', { insertedId: result.insertedId, acknowledged: result.acknowledged });

    // Return the actual document from database
    const insertedDoc = await db.collection('evidence').findOne({ _id: result.insertedId });
    console.log('📄 Retrieved inserted evidence document:', insertedDoc);

    return insertedDoc;
  },

  async findById(id) {
    console.log('🔍 Finding evidence by ID:', id);
    const db = getDatabase();
    const evidence = await db.collection('evidence').findOne({ _id: new ObjectId(id) });
    console.log('📄 Found evidence:', evidence ? 'Yes' : 'No');
    return evidence;
  },

  async findByEvidenceNumber(evidenceNumber) {
    console.log('🔍 Finding evidence by evidence number:', evidenceNumber);
    const db = getDatabase();
    return await db.collection('evidence').findOne({ evidenceNumber });
  },

  async findByCaseId(caseId) {
    console.log('🔍 Finding evidence by case ID:', caseId);
    const db = getDatabase();
    return await db.collection('evidence').find({ caseId }).toArray();
  },

  async findByOBId(obId) {
    console.log('🔍 Finding evidence by OB ID:', obId);
    const db = getDatabase();
    return await db.collection('evidence').find({ obId }).toArray();
  },

  async findAll() {
    console.log('🔍 Fetching all evidence from MongoDB');
    const db = getDatabase();
    const evidence = await db.collection('evidence').find({}).sort({ createdAt: -1 }).toArray();
    console.log('📊 Found evidence in MongoDB:', evidence.length, 'records');
    return evidence;
  },

  async findByStatus(status) {
    console.log('🔍 Finding evidence by status:', status);
    const db = getDatabase();
    return await db.collection('evidence').find({ status }).toArray();
  },

  async findByType(type) {
    console.log('🔍 Finding evidence by type:', type);
    const db = getDatabase();
    return await db.collection('evidence').find({ type }).toArray();
  },

  async addCustodyEntry(id, custodyEntry) {
    console.log('🔍 Adding custody entry to evidence:', id, custodyEntry);
    const db = getDatabase();
    const result = await db.collection('evidence').updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { custodyLog: { ...custodyEntry, timestamp: new Date() } },
        $set: { updatedAt: new Date() }
      }
    );
    console.log('📝 Custody entry add result:', { modifiedCount: result.modifiedCount });
    return result.modifiedCount > 0;
  },

  async update(id, updateData) {
    console.log('🔍 Updating evidence:', id, 'with data:', updateData);
    const db = getDatabase();

    // Remove fields that shouldn't be directly updated
    const { custodyLog, evidenceNumber, createdAt, ...safeUpdateData } = updateData;

    const result = await db.collection('evidence').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...safeUpdateData, updatedAt: new Date() } }
    );
    console.log('📝 Evidence update result:', { modifiedCount: result.modifiedCount });
    return result.modifiedCount > 0;
  },

  async addMedia(id, mediaFile) {
    console.log('🔍 Adding media to evidence:', id, mediaFile);
    const db = getDatabase();
    const result = await db.collection('evidence').updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { media: { ...mediaFile, uploadedAt: new Date() } },
        $set: { updatedAt: new Date() }
      }
    );
    return result.modifiedCount > 0;
  },

  async delete(id) {
    console.log('🔍 Deleting evidence:', id);
    const db = getDatabase();
    const result = await db.collection('evidence').deleteOne({ _id: new ObjectId(id) });
    console.log('📝 Evidence delete result:', { deletedCount: result.deletedCount });
    return result.deletedCount > 0;
  },

  async getEvidenceStats() {
    console.log('🔍 Getting evidence statistics');
    const db = getDatabase();
    const stats = await db.collection('evidence').aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byStatus: {
            $push: {
              status: '$status',
              count: 1
            }
          },
          byType: {
            $push: {
              type: '$type',
              count: 1
            }
          }
        }
      }
    ]).toArray();

    return stats[0] || { total: 0, byStatus: [], byType: [] };
  }
};

// Police Vehicles CRUD
export const PoliceVehiclesCRUD = {
  async create(vehicleData) {
    const db = getDatabase();
    const result = await db.collection('police_vehicles').insertOne({
      ...vehicleData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { ...vehicleData, _id: result.insertedId };
  },

  async findById(id) {
    const db = getDatabase();
    return await db.collection('police_vehicles').findOne({ _id: new ObjectId(id) });
  },

  async findByVehicleId(vehicleId) {
    const db = getDatabase();
    return await db.collection('police_vehicles').findOne({ vehicleId });
  },

  async findAll() {
    const db = getDatabase();
    return await db.collection('police_vehicles').find({}).toArray();
  },

  async findByStatus(status) {
    const db = getDatabase();
    return await db.collection('police_vehicles').find({ status }).toArray();
  },

  async update(id, updateData) {
    const db = getDatabase();
    const result = await db.collection('police_vehicles').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  },

  async delete(id) {
    const db = getDatabase();
    const result = await db.collection('police_vehicles').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
};

// Officers Collection CRUD
export const OfficersCRUD = {
  async create(officerData) {
    console.log('🔍 Creating officer in MongoDB with data:', officerData);
    const db = getDatabase();

    // Generate badge number if not provided
    const badgeNumber = officerData.badgeNumber || `OFC-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const docToInsert = {
      ...officerData,
      badgeNumber,
      status: officerData.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('📝 Officer document to insert:', docToInsert);

    const result = await db.collection('officers').insertOne(docToInsert);
    console.log('✅ Officer insert result:', { insertedId: result.insertedId, acknowledged: result.acknowledged });

    // Return the actual document from database
    const insertedDoc = await db.collection('officers').findOne({ _id: result.insertedId });
    console.log('📄 Retrieved inserted officer document:', insertedDoc);

    return insertedDoc;
  },

  async findById(id) {
    const db = getDatabase();
    return await db.collection('officers').findOne({ _id: new ObjectId(id) });
  },

  async findByBadgeNumber(badgeNumber) {
    const db = getDatabase();
    return await db.collection('officers').findOne({ badgeNumber });
  },

  async findByDepartment(department) {
    const db = getDatabase();
    return await db.collection('officers').find({ department }).toArray();
  },

  async findAll() {
    console.log('🔍 Fetching all officers from MongoDB');
    const db = getDatabase();
    const officers = await db.collection('officers').find({}).sort({ createdAt: -1 }).toArray();
    console.log('📊 Found officers in MongoDB:', officers.length, 'records');
    return officers;
  },

  async update(id, updateData) {
    console.log('🔍 Updating officer:', id, 'with data:', updateData);
    const db = getDatabase();
    const result = await db.collection('officers').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    console.log('📝 Officer update result:', { modifiedCount: result.modifiedCount });
    return result.modifiedCount > 0;
  },

  async delete(id) {
    const db = getDatabase();
    const result = await db.collection('officers').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
};

// Reports CRUD
export const ReportsCRUD = {
  async create(reportData) {
    console.log('🔍 Creating report with data:', reportData);
    const db = getDatabase();
    const docToInsert = {
      ...reportData,
      reportNumber: reportData.reportNumber || `RPT-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('reports').insertOne(docToInsert);
    console.log('✅ Report created successfully with ID:', result.insertedId);

    const createdReport = await db.collection('reports').findOne({ _id: result.insertedId });
    return { ...createdReport, id: createdReport._id.toString() };
  },

  async findById(id) {
    const db = getDatabase();
    return await db.collection('reports').findOne({ _id: new ObjectId(id) });
  },

  async findAll() {
    console.log('🔍 Fetching all reports from MongoDB');
    const db = getDatabase();
    const reports = await db.collection('reports').find({}).sort({ createdAt: -1 }).toArray();
    console.log('📊 Found reports in MongoDB:', reports.length, 'records');
    return reports;
  },

  async update(id, updateData) {
    const db = getDatabase();
    const result = await db.collection('reports').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  },

  async delete(id) {
    const db = getDatabase();
    const result = await db.collection('reports').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
};

// Geofiles CRUD
export const GeofilesCRUD = {
  async create(geofileData) {
    console.log('🔍 Creating geofile in MongoDB with data:', geofileData);
    const db = getDatabase();

    const docToInsert = {
      ...geofileData,
      downloadCount: geofileData.downloadCount || 0,
      lastAccessedAt: geofileData.lastAccessedAt || new Date(),
      isPublic: geofileData.isPublic || false,
      accessLevel: geofileData.accessLevel || 'internal',
      tags: geofileData.tags || [],
      metadata: typeof geofileData.metadata === 'string' ? JSON.parse(geofileData.metadata || '{}') : geofileData.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('📝 Geofile document to insert:', docToInsert);

    const result = await db.collection('geofiles').insertOne(docToInsert);
    console.log('✅ Geofile insert result:', { insertedId: result.insertedId, acknowledged: result.acknowledged });

    // Return the actual document from database
    const insertedDoc = await db.collection('geofiles').findOne({ _id: result.insertedId });
    console.log('📄 Retrieved inserted geofile document:', insertedDoc);

    return {
      ...insertedDoc,
      id: insertedDoc._id.toString()
    };
  },

  async findById(id) {
    console.log('🔍 Finding geofile by ID:', id);
    const db = getDatabase();
    const geofile = await db.collection('geofiles').findOne({ _id: new ObjectId(id) });
    console.log('📄 Found geofile:', geofile ? 'Yes' : 'No');
    return geofile;
  },

  async findAll(filters = {}) {
    console.log('🔍 Fetching all geofiles from MongoDB with filters:', filters);
    const db = getDatabase();

    let query = {};

    // Apply search filter
    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: 'i' };
      query.$or = [
        { filename: searchRegex },
        { description: searchRegex },
        { address: searchRegex },
        { locationName: searchRegex }
      ];
    }

    // Apply file type filter
    if (filters.fileType) {
      query.fileType = { $regex: `^${filters.fileType}$`, $options: 'i' };
    }

    // Apply access level filter
    if (filters.accessLevel) {
      query.accessLevel = filters.accessLevel;
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    // Apply date range filter
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }

    const geofiles = await db.collection('geofiles').find(query).sort({ createdAt: -1 }).toArray();
    console.log('📊 Found geofiles in MongoDB:', geofiles.length, 'records');

    // Transform the data to match frontend expectations
    const transformedGeofiles = geofiles.map(geofile => ({
      ...geofile,
      id: geofile._id.toString(),
      tags: Array.isArray(geofile.tags) ? geofile.tags : JSON.parse(geofile.tags || '[]'),
      metadata: typeof geofile.metadata === 'object' ? geofile.metadata : JSON.parse(geofile.metadata || '{}')
    }));

    return transformedGeofiles;
  },

  async findByType(fileType) {
    console.log('🔍 Finding geofiles by type:', fileType);
    const db = getDatabase();
    return await db.collection('geofiles').find({
      fileType: { $regex: `^${fileType}$`, $options: 'i' }
    }).toArray();
  },

  async findByAccessLevel(accessLevel) {
    console.log('🔍 Finding geofiles by access level:', accessLevel);
    const db = getDatabase();
    return await db.collection('geofiles').find({ accessLevel }).toArray();
  },

  async findByTags(tags) {
    console.log('🔍 Finding geofiles by tags:', tags);
    const db = getDatabase();
    return await db.collection('geofiles').find({
      tags: { $in: Array.isArray(tags) ? tags : [tags] }
    }).toArray();
  },

  async update(id, updateData) {
    console.log('🔍 Updating geofile:', id, 'with data:', updateData);
    const db = getDatabase();

    // Process tags and metadata
    const processedData = { ...updateData };
    if (processedData.tags && typeof processedData.tags === 'string') {
      processedData.tags = JSON.parse(processedData.tags);
    }
    if (processedData.metadata && typeof processedData.metadata === 'string') {
      processedData.metadata = JSON.parse(processedData.metadata);
    }

    const result = await db.collection('geofiles').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...processedData, updatedAt: new Date() } }
    );
    console.log('📝 Geofile update result:', { modifiedCount: result.modifiedCount });
    return result.modifiedCount > 0;
  },

  async delete(id) {
    console.log('🗑️ Deleting geofile:', id);
    const db = getDatabase();
    const result = await db.collection('geofiles').deleteOne({ _id: new ObjectId(id) });
    console.log('📝 Geofile delete result:', { deletedCount: result.deletedCount });
    return result.deletedCount > 0;
  },

  async updateAccess(id) {
    console.log('🔍 Updating geofile access timestamp:', id);
    const db = getDatabase();
    const result = await db.collection('geofiles').updateOne(
      { _id: new ObjectId(id) },
      { $set: { lastAccessedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  },

  async incrementDownload(id) {
    console.log('🔍 Incrementing geofile download count:', id);
    const db = getDatabase();
    const result = await db.collection('geofiles').updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { downloadCount: 1 },
        $set: { lastAccessedAt: new Date() }
      }
    );
    return result.modifiedCount > 0;
  },

  async getStats() {
    console.log('🔍 Getting geofiles statistics');
    const db = getDatabase();
    const stats = await db.collection('geofiles').aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byFileType: {
            $push: {
              fileType: '$fileType',
              count: 1
            }
          },
          byAccessLevel: {
            $push: {
              accessLevel: '$accessLevel',
              count: 1
            }
          },
          totalDownloads: { $sum: '$downloadCount' }
        }
      }
    ]).toArray();

    return stats[0] || { total: 0, byFileType: [], byAccessLevel: [], totalDownloads: 0 };
  }
};

// Custodial Records (Inmates) CRUD
export const CustodialCRUD = {
  async create(inmateData) {
    console.log('🔍 Creating custodial record in MongoDB with data:', inmateData);
    const db = getDatabase();

    // Generate prisoner number if not provided
    const prisonerNumber = inmateData.prisonerNumber || `INM-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const docToInsert = {
      ...inmateData,
      prisonerNumber,
      charges: Array.isArray(inmateData.charges) ? inmateData.charges : [],
      admissionDate: inmateData.admissionDate || new Date(),
      status: inmateData.status || 'Active',
      riskLevel: inmateData.riskLevel || 'Medium',
      classification: inmateData.classification || 'Medium Security',
      suicideRisk: inmateData.suicideRisk || 'false',
      bailPosted: inmateData.bailPosted || 'false',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('📝 Custodial document to insert:', docToInsert);

    const result = await db.collection('custodial_records').insertOne(docToInsert);
    console.log('✅ Custodial record insert result:', { insertedId: result.insertedId, acknowledged: result.acknowledged });

    // Return the actual document from database
    const insertedDoc = await db.collection('custodial_records').findOne({ _id: result.insertedId });
    console.log('📄 Retrieved inserted custodial document:', insertedDoc);

    return insertedDoc;
  },

  async findById(id) {
    console.log('🔍 Finding custodial record by ID:', id);
    const db = getDatabase();
    const record = await db.collection('custodial_records').findOne({ _id: new ObjectId(id) });
    console.log('📄 Found custodial record:', record ? 'Yes' : 'No');
    return record;
  },

  async findByPrisonerNumber(prisonerNumber) {
    console.log('🔍 Finding custodial record by prisoner number:', prisonerNumber);
    const db = getDatabase();
    return await db.collection('custodial_records').findOne({ prisonerNumber });
  },

  async findAll(filters = {}) {
    console.log('🔍 Fetching all custodial records from MongoDB with filters:', filters);
    const db = getDatabase();

    let query = {};

    // Apply status filter
    if (filters.status && filters.status !== 'All') {
      query.status = filters.status;
    }

    // Apply risk level filter
    if (filters.riskLevel && filters.riskLevel !== 'All') {
      query.riskLevel = filters.riskLevel;
    }

    // Apply classification filter
    if (filters.classification && filters.classification !== 'All') {
      query.classification = filters.classification;
    }

    // Apply search filter
    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: 'i' };
      query.$or = [
        { fullName: searchRegex },
        { prisonerNumber: searchRegex },
        { charges: { $in: [searchRegex] } }
      ];
    }

    const records = await db.collection('custodial_records').find(query).sort({ createdAt: -1 }).toArray();
    console.log('📊 Found custodial records in MongoDB:', records.length, 'records');
    return records;
  },

  async findByStatus(status) {
    console.log('🔍 Finding custodial records by status:', status);
    const db = getDatabase();
    return await db.collection('custodial_records').find({ status }).toArray();
  },

  async findByRiskLevel(riskLevel) {
    console.log('🔍 Finding custodial records by risk level:', riskLevel);
    const db = getDatabase();
    return await db.collection('custodial_records').find({ riskLevel }).toArray();
  },

  async search(query) {
    console.log('🔍 Searching custodial records with query:', query);
    const db = getDatabase();
    const searchRegex = { $regex: query, $options: 'i' };

    return await db.collection('custodial_records').find({
      $or: [
        { fullName: searchRegex },
        { prisonerNumber: searchRegex },
        { charges: { $in: [searchRegex] } },
        { nationality: searchRegex }
      ]
    }).toArray();
  },

  async update(id, updateData) {
    console.log('🔍 Updating custodial record:', id, 'with data:', updateData);
    const db = getDatabase();

    // Process arrays and data types
    const processedData = { ...updateData };
    if (processedData.charges && typeof processedData.charges === 'string') {
      processedData.charges = JSON.parse(processedData.charges);
    }

    const result = await db.collection('custodial_records').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...processedData, updatedAt: new Date() } }
    );
    console.log('📝 Custodial record update result:', { modifiedCount: result.modifiedCount });
    return result.modifiedCount > 0;
  },

  async delete(id) {
    console.log('🗑️ Deleting custodial record:', id);
    const db = getDatabase();
    const result = await db.collection('custodial_records').deleteOne({ _id: new ObjectId(id) });
    console.log('📝 Custodial record delete result:', { deletedCount: result.deletedCount });
    return result.deletedCount > 0;
  },

  async getStats() {
    console.log('🔍 Getting custodial records statistics');
    const db = getDatabase();
    const stats = await db.collection('custodial_records').aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byStatus: {
            $push: {
              status: '$status',
              count: 1
            }
          },
          byRiskLevel: {
            $push: {
              riskLevel: '$riskLevel',
              count: 1
            }
          },
          byClassification: {
            $push: {
              classification: '$classification',
              count: 1
            }
          }
        }
      }
    ]).toArray();

    return stats[0] || { total: 0, byStatus: [], byRiskLevel: [], byClassification: [] };
  },

  async seedSampleData() {
    console.log('🌱 Seeding sample custodial records...');
    const db = getDatabase();

    // Check if records already exist
    const existingCount = await db.collection('custodial_records').countDocuments();
    if (existingCount > 0) {
      console.log('✅ Custodial records already exist, skipping seed');
      return [];
    }

    const sampleInmates = [
      {
        fullName: "Ahmed Hassan Mohamed",
        prisonerNumber: "INM-2025-001AH",
        dateOfBirth: new Date("1985-03-15"),
        age: 39,
        gender: "Male",
        nationality: "Somali",
        maritalStatus: "Married",
        education: "High School",
        religion: "Islam",
        address: "Hodan District, Mogadishu",
        admissionDate: new Date("2024-11-15"),
        charges: ["Theft", "Burglary"],
        sentence: "3 years",
        courtReference: "CRT-2024-1543",
        bailPosted: "false",
        emergencyContactName: "Fatima Hassan",
        relationship: "Spouse",
        contactPhone: "+252-61-1234567",
        contactAddress: "Hodan District, Mogadishu",
        medicalConditions: "Hypertension",
        allergies: "Penicillin",
        doctorNotes: "Regular blood pressure monitoring required",
        suicideRisk: "false",
        behaviorReports: "Cooperative, follows facility rules",
        disciplinaryActions: "None",
        privileges: "Library access, recreation time",
        riskLevel: "Low",
        classification: "Medium Security",
        status: "Active"
      },
      {
        fullName: "Mariam Abdullahi Omar",
        prisonerNumber: "INM-2025-002MO",
        dateOfBirth: new Date("1992-07-22"),
        age: 32,
        gender: "Female",
        nationality: "Somali",
        maritalStatus: "Single",
        education: "University",
        religion: "Islam",
        address: "Wadajir District, Mogadishu",
        admissionDate: new Date("2024-12-01"),
        charges: ["Fraud", "Money Laundering"],
        sentence: "5 years",
        courtReference: "CRT-2024-1687",
        bailPosted: "true",
        emergencyContactName: "Omar Abdullahi",
        relationship: "Father",
        contactPhone: "+252-61-2345678",
        contactAddress: "Wadajir District, Mogadishu",
        medicalConditions: "Diabetes Type 2",
        allergies: "None known",
        doctorNotes: "Requires insulin monitoring and dietary management",
        suicideRisk: "false",
        behaviorReports: "Model prisoner, helps with educational programs",
        disciplinaryActions: "None",
        privileges: "Library access, education programs, work detail",
        riskLevel: "Low",
        classification: "Minimum Security",
        status: "Active"
      },
      {
        fullName: "Abdi Rahman Jama",
        prisonerNumber: "INM-2025-003AJ",
        dateOfBirth: new Date("1988-12-10"),
        age: 36,
        gender: "Male",
        nationality: "Somali",
        maritalStatus: "Divorced",
        education: "Secondary",
        religion: "Islam",
        address: "Karaan District, Mogadishu",
        admissionDate: new Date("2024-10-20"),
        charges: ["Assault", "Public Disorder"],
        sentence: "18 months",
        courtReference: "CRT-2024-1234",
        bailPosted: "false",
        emergencyContactName: "Khadija Jama",
        relationship: "Mother",
        contactPhone: "+252-61-3456789",
        contactAddress: "Karaan District, Mogadishu",
        medicalConditions: "Anxiety disorder",
        allergies: "Sulfa drugs",
        doctorNotes: "Regular counseling sessions recommended",
        suicideRisk: "true",
        behaviorReports: "Occasional aggressive behavior, improving with counseling",
        disciplinaryActions: "Verbal warning for altercation (2024-11-15)",
        privileges: "Recreation time, counseling sessions",
        riskLevel: "High",
        classification: "Maximum Security",
        status: "Active"
      },
      {
        fullName: "Sahra Mohamed Ali",
        prisonerNumber: "INM-2025-004SA",
        dateOfBirth: new Date("1995-05-08"),
        age: 29,
        gender: "Female",
        nationality: "Somali",
        maritalStatus: "Married",
        education: "College",
        religion: "Islam",
        address: "Shangani District, Mogadishu",
        admissionDate: new Date("2024-09-12"),
        charges: ["Drug Possession", "Trafficking"],
        sentence: "7 years",
        courtReference: "CRT-2024-0987",
        bailPosted: "false",
        emergencyContactName: "Hassan Ali",
        relationship: "Spouse",
        contactPhone: "+252-61-4567890",
        contactAddress: "Shangani District, Mogadishu",
        medicalConditions: "Asthma",
        allergies: "Dust, pollen",
        doctorNotes: "Requires inhaler access, avoid dusty environments",
        suicideRisk: "false",
        behaviorReports: "Good behavior, participates in rehabilitation programs",
        disciplinaryActions: "None",
        privileges: "Library access, rehabilitation programs, work detail",
        riskLevel: "Medium",
        classification: "Medium Security",
        status: "Active"
      },
      {
        fullName: "Mohamed Farah Aidid",
        prisonerNumber: "INM-2024-105MF",
        dateOfBirth: new Date("1980-01-25"),
        age: 44,
        gender: "Male",
        nationality: "Somali",
        maritalStatus: "Married",
        education: "University",
        religion: "Islam",
        address: "Yaqshid District, Mogadishu",
        admissionDate: new Date("2024-06-10"),
        charges: ["Weapons Charges", "Public Disorder"],
        sentence: "4 years",
        courtReference: "CRT-2024-0654",
        bailPosted: "false",
        emergencyContactName: "Amina Farah",
        relationship: "Spouse",
        contactPhone: "+252-61-5678901",
        contactAddress: "Yaqshid District, Mogadishu",
        medicalConditions: "Lower back pain",
        allergies: "None known",
        doctorNotes: "Physical therapy recommended, avoid heavy lifting",
        suicideRisk: "false",
        behaviorReports: "Leadership qualities, sometimes challenging authority",
        disciplinaryActions: "Written warning for organizing unauthorized gathering",
        privileges: "Recreation time, limited work detail",
        riskLevel: "Medium",
        classification: "Medium Security",
        status: "Court Appearance"
      }
    ];

    const result = await db.collection('custodial_records').insertMany(sampleInmates);
    console.log('✅ Custodial records seeded successfully:', result.insertedIds);
    return sampleInmates;
  }
};