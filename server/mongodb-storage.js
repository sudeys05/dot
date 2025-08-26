import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export class MongoStorage {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  async connect(connectionString = 'mongodb://localhost:27017/police_management') {
    try {
      // MongoDB connection options for better compatibility
      const options = {
        retryWrites: true,
        w: 'majority',
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        serverSelectionTimeoutMS: 30000,
        maxPoolSize: 10,
        minPoolSize: 1,
      };

      this.client = new MongoClient(connectionString, options);
      await this.client.connect();
      this.db = this.client.db();
      this.isConnected = true;
      console.log('Connected to MongoDB Atlas');

      // Test the connection
      await this.db.admin().ping();
      console.log('MongoDB connection verified');

      // Create indexes for better performance
      await this.createIndexes();

      // Create default admin user if it doesn't exist
      await this.createDefaultAdmin();

      return true;
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
      if (error.message.includes('SSL') || error.message.includes('TLS')) {
        console.log('SSL/TLS connection issue detected. This might be due to network restrictions.');
        console.log('Try connecting from a different network or check your MongoDB Atlas settings.');
      }
      return false;
    }
  }

  async createIndexes() {
    // User indexes
    await this.db.collection('users').createIndex({ username: 1 }, { unique: true });
    await this.db.collection('users').createIndex({ email: 1 }, { unique: true });
    await this.db.collection('users').createIndex({ badgeNumber: 1 });

    // Profile indexes
    await this.db.collection('profiles').createIndex({ userId: 1 }, { unique: true });
    await this.db.collection('profiles').createIndex({ username: 1 });
    await this.db.collection('profiles').createIndex({ email: 1 });
    await this.db.collection('profiles').createIndex({ badgeNumber: 1 });

    // Case indexes
    await this.db.collection('cases').createIndex({ caseNumber: 1 }, { unique: true });
    await this.db.collection('cases').createIndex({ status: 1 });
    await this.db.collection('cases').createIndex({ priority: 1 });
    await this.db.collection('cases').createIndex({ createdAt: -1 });

    // OB Entry indexes
    await this.db.collection('ob_entries').createIndex({ obNumber: 1 }, { unique: true });
    await this.db.collection('ob_entries').createIndex({ dateTime: -1 });

    // License plate indexes
    await this.db.collection('license_plates').createIndex({ plateNumber: 1 }, { unique: true });

    // Evidence indexes
    await this.db.collection('evidence').createIndex({ evidenceNumber: 1 }, { unique: true });
    await this.db.collection('evidence').createIndex({ caseId: 1 });

    // Vehicle indexes
    await this.db.collection('police_vehicles').createIndex({ vehicleId: 1 }, { unique: true });
    await this.db.collection('police_vehicles').createIndex({ licensePlate: 1 }, { unique: true });
  }

  async createDefaultAdmin() {
    const existingAdmin = await this.db.collection('users').findOne({ username: 'admin' });
    if (!existingAdmin) {
      const adminUser = {
        username: 'admin',
        email: 'admin@police.gov',
        password: 'admin123', // In production, hash this password
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        badgeNumber: 'ADMIN001',
        department: 'IT',
        position: 'System Administrator',
        phone: '+1-555-0000',
        profileImage: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      };
      await this.db.collection('users').insertOne(adminUser);
      console.log('Default admin user created');
    } else {
      // Ensure existing admin is active
      await this.db.collection('users').updateOne(
        { username: 'admin' },
        { $set: { isActive: true, updatedAt: new Date() } }
      );
      console.log('Admin user activated');
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    }
  }

  // User methods
  async createUser(userData) {
    const result = await this.db.collection('users').insertOne({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.db.collection('users').findOne({ _id: result.insertedId });
  }

  async getUserByUsername(username) {
    return await this.db.collection('users').findOne({ username });
  }

  async getUserByEmail(email) {
    return await this.db.collection('users').findOne({ email });
  }

  async getUser(id) {
    return await this.db.collection('users').findOne({ _id: new ObjectId(id) });
  }

  async getAllUsers() {
    return await this.db.collection('users').find({}).toArray();
  }

  async updateUser(id, updates) {
    await this.db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return await this.getUser(id);
  }

  async updateLastLogin(id) {
    await this.db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { lastLoginAt: new Date() } }
    );
  }

  async deleteUser(id) {
    await this.db.collection('users').deleteOne({ _id: new ObjectId(id) });
  }

  // Case methods
  async createCase(caseData) {
    const caseNumber = `CASE-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const result = await this.db.collection('cases').insertOne({
      ...caseData,
      caseNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.db.collection('cases').findOne({ _id: result.insertedId });
  }

  async getCases() {
    return await this.db.collection('cases').find({}).sort({ createdAt: -1 }).toArray();
  }

  async getCase(id) {
    return await this.db.collection('cases').findOne({ _id: new ObjectId(id) });
  }

  async updateCase(id, updates) {
    await this.db.collection('cases').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return await this.getCase(id);
  }

  async deleteCase(id) {
    await this.db.collection('cases').deleteOne({ _id: new ObjectId(id) });
  }

  // OB Entry methods
  async createOBEntry(obData) {
    const obNumber = `OB-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const result = await this.db.collection('obEntries').insertOne({
      ...obData,
      obNumber,
      dateTime: obData.dateTime || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.db.collection('obEntries').findOne({ _id: result.insertedId });
  }

  async getOBEntries() {
    return await this.db.collection('obEntries').find({}).sort({ dateTime: -1 }).toArray();
  }

  async updateOBEntry(id, updates) {
    await this.db.collection('obEntries').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return await this.db.collection('obEntries').findOne({ _id: new ObjectId(id) });
  }

  async deleteOBEntry(id) {
    await this.db.collection('obEntries').deleteOne({ _id: new ObjectId(id) });
  }

  // License Plate methods
  async createLicensePlate(plateData) {
    const result = await this.db.collection('licensePlates').insertOne({
      ...plateData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.db.collection('licensePlates').findOne({ _id: result.insertedId });
  }

  async getLicensePlates() {
    return await this.db.collection('licensePlates').find({}).toArray();
  }

  async getLicensePlateByNumber(plateNumber) {
    return await this.db.collection('licensePlates').findOne({ plateNumber });
  }

  async updateLicensePlate(id, updates) {
    await this.db.collection('licensePlates').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return await this.db.collection('licensePlates').findOne({ _id: new ObjectId(id) });
  }

  async deleteLicensePlate(id) {
    await this.db.collection('licensePlates').deleteOne({ _id: new ObjectId(id) });
  }

  // Evidence methods
  async createEvidence(evidenceData) {
    const evidenceNumber = `EV-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const result = await this.db.collection('evidence').insertOne({
      ...evidenceData,
      evidenceNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.db.collection('evidence').findOne({ _id: result.insertedId });
  }

  async getEvidence() {
    return await this.db.collection('evidence').find({}).toArray();
  }

  async getEvidenceItem(id) {
    return await this.db.collection('evidence').findOne({ _id: new ObjectId(id) });
  }

  async updateEvidence(id, updates) {
    await this.db.collection('evidence').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return await this.db.collection('evidence').findOne({ _id: new ObjectId(id) });
  }

  async deleteEvidence(id) {
    await this.db.collection('evidence').deleteOne({ _id: new ObjectId(id) });
  }

  // Police Vehicle methods
  async createPoliceVehicle(vehicleData) {
    const result = await this.db.collection('policeVehicles').insertOne({
      ...vehicleData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.db.collection('policeVehicles').findOne({ _id: result.insertedId });
  }

  async getPoliceVehicles() {
    return await this.db.collection('policeVehicles').find({}).toArray();
  }

  async updatePoliceVehicle(id, updates) {
    await this.db.collection('policeVehicles').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return await this.db.collection('policeVehicles').findOne({ _id: new ObjectId(id) });
  }

  // Geofile methods
  async createGeofile(geofileData) {
    const result = await this.db.collection('geofiles').insertOne({
      ...geofileData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.db.collection('geofiles').findOne({ _id: result.insertedId });
  }

  async getGeofiles(filters = {}) {
    const query = {};

    if (filters.search) {
      query.$or = [
        { filename: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { locationName: { $regex: filters.search, $options: 'i' } }
      ];
    }

    if (filters.fileType) {
      query.fileType = filters.fileType;
    }

    if (filters.accessLevel) {
      query.accessLevel = filters.accessLevel;
    }

    return await this.db.collection('geofiles').find(query).sort({ createdAt: -1 }).toArray();
  }

  async getGeofile(id) {
    return await this.db.collection('geofiles').findOne({ _id: new ObjectId(id) });
  }

  async updateGeofileAccess(id) {
    await this.db.collection('geofiles').updateOne(
      { _id: new ObjectId(id) },
      { $set: { lastAccessedAt: new Date() } }
    );
  }

  async incrementGeofileDownload(id) {
    await this.db.collection('geofiles').updateOne(
      { _id: new ObjectId(id) },
      { $inc: { downloadCount: 1 } }
    );
  }

  // Password reset token methods
  async createPasswordResetToken(userId, token) {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await this.db.collection('passwordResetTokens').insertOne({
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    });
  }

  async getPasswordResetToken(token) {
    const tokenData = await this.db.collection('passwordResetTokens').findOne({
      token,
      expiresAt: { $gt: new Date() }
    });
    return tokenData;
  }

  async deletePasswordResetToken(token) {
    await this.db.collection('passwordResetTokens').deleteOne({ token });
  }

  async updateUserPassword(userId, password) {
    await this.db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password, updatedAt: new Date() } }
    );
  }
}

// Export a singleton instance
export const mongoStorage = new MongoStorage();