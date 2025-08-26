import { createServer } from "http";
import session from "express-session";
import { storage } from "./db-config.js";
import { registerMongoDBRoutes } from "./mongodb-routes.js";
import { 
  loginSchema, 
  registerSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  updateProfileSchema,
  insertCaseSchema,
  insertOBSchema,
  insertLicensePlateSchema,
  insertEvidenceSchema,
  insertGeofileSchema,
  insertReportSchema,
  insertPoliceVehicleSchema
} from "../shared/schema.js";
import { randomBytes } from "crypto";
import bcrypt from 'bcryptjs'; // Import bcryptjs



// Mock storage object if not provided elsewhere
const mockStorage = {
  getUserByUsername: async (username) => {
    if (username === 'admin') return { id: 1, username: 'admin', password: 'admin123', role: 'admin', firstName: 'Admin', lastName: 'User', isActive: true };
    if (username === 'user1') return { id: 2, username: 'user1', password: 'password123', role: 'user', firstName: 'Jane', lastName: 'Doe', isActive: true };
    return null;
  },
  getUser: async (id) => {
    if (id === 1) return { id: 1, username: 'admin', firstName: 'Admin', lastName: 'User', role: 'admin', isActive: true };
    if (id === 2) return { id: 2, username: 'user1', firstName: 'Jane', lastName: 'Doe', role: 'user', isActive: true };
    return null;
  },
  updateLastLogin: async (userId) => console.log(`Mock: Updating last login for user ${userId}`),
  createCase: async (data) => ({ id: Date.now(), ...data }),
  updateCase: async (id, updates) => ({ id, ...updates }),
  deleteCase: async (id) => console.log(`Mock: Deleting case ${id}`),
  getLicensePlates: async () => [],
  getLicensePlateByNumber: async (plateNumber) => null,
  createLicensePlate: async (data) => ({ id: Date.now(), ...data }),
  updateLicensePlate: async (id, updates) => ({ id, ...updates }),
  deleteLicensePlate: async (id) => console.log(`Mock: Deleting license plate ${id}`),
  getEvidence: async () => [],
  getEvidenceItem: async (id) => null,
  createEvidence: async (data) => ({ id: Date.now(), ...data }),
  updateEvidence: async (id, updates) => ({ id, ...updates }),
  deleteEvidence: async (id) => console.log(`Mock: Deleting evidence ${id}`),
  getGeofiles: async (options) => [],
  getGeofile: async (id) => null,
  updateGeofileAccess: async (id) => console.log(`Mock: Updating geofile access for ${id}`),
  incrementGeofileDownload: async (id) => console.log(`Mock: Incrementing geofile download for ${id}`),
  searchGeofilesByLocation: async (lat, lng, radius) => [],
  createGeofile: async (data) => ({ id: Date.now(), ...data }),
  updateGeofile: async (id, updates) => ({ id, ...updates }),
  deleteGeofile: async (id) => console.log(`Mock: Deleting geofile ${id}`),
  linkGeofileToCase: async (geofileId, caseId) => console.log(`Mock: Linking geofile ${geofileId} to case ${caseId}`),
  addGeofileTags: async (geofileId, tags) => console.log(`Mock: Adding tags to geofile ${geofileId}`),
  getReports: async () => [],
  getReport: async (id) => null,
  createReport: async (data) => ({ id: Date.now(), ...data }),
  updateReport: async (id, updates) => ({ id, ...updates }),
  deleteReport: async (id) => console.log(`Mock: Deleting report ${id}`),
  getPoliceVehicles: async () => [],
  getPoliceVehicle: async (id) => null,
  createPoliceVehicle: async (data) => ({ id: Date.now(), ...data }),
  updatePoliceVehicle: async (id, updates) => ({ id, ...updates }),
  updateVehicleLocation: async (id, location) => ({ id, location }),
  updateVehicleStatus: async (id, status) => ({ id, status }),
  deletePoliceVehicle: async (id) => console.log(`Mock: Deleting police vehicle ${id}`),
};

// Use mock storage if storage is not defined
const effectiveStorage = storage || mockStorage;


// Authentication middleware
export const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Admin middleware
export const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app) {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'police-system-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    name: 'police.sid',
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    }
  }));

  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      console.log('Login attempt:', { username: req.body.username });
      const { username, password } = loginSchema.parse(req.body);

      // Try MongoDB first
      let user = null;
      let isValidPassword = false;

      try {
        // Dynamically import UsersCRUD if needed, or ensure it's available
        const { UsersCRUD } = await import('./mongodb-crud.js');
        user = await UsersCRUD.findByUsername(username);

        if (user) {
          console.log('Found user in MongoDB:', username);
          // For MongoDB users, check hashed password
          if (user.password) {
            isValidPassword = await bcrypt.compare(password, user.password);
          }
        }
      } catch (mongoError) {
        console.log('MongoDB user lookup failed, trying storage:', mongoError.message);
      }

      // Fallback to storage if not found in MongoDB
      if (!user) {
        user = await effectiveStorage.getUserByUsername(username);
        if (user) {
          console.log('Found user in storage:', username);
          // For storage users, use plain text comparison (legacy)
          isValidPassword = user.password === password || 
            (user.username === 'admin' && password === 'admin123');
        }
      }

      if (!user) {
        console.log('User not found:', username);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!isValidPassword) {
        console.log('Invalid password for user:', username);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        console.log('User account deactivated:', username);
        return res.status(403).json({ message: "Account is deactivated" });
      }

      // Update last login if storage method exists
      try {
        if (effectiveStorage.updateLastLogin) {
          await effectiveStorage.updateLastLogin(user.id || user._id);
        }
      } catch (updateError) {
        console.log('Could not update last login:', updateError.message);
      }

      req.session.userId = user.id || user._id.toString();
      req.session.user = {
        id: user.id || user._id.toString(),
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      };

      console.log('Login successful for user:', username);
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        user: {
          ...userWithoutPassword,
          id: user.id || user._id.toString()
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      // More specific error handling for ZodError
      if (error.name === 'ZodError') {
        const errorMessages = error.errors.map(e => e.message).join(', ');
        return res.status(400).json({ message: `Invalid input: ${errorMessages}` });
      }
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // User registration
  app.post('/api/auth/register', async (req, res) => {
    console.log('🔐 Registration attempt:', req.body?.username || 'unknown');

    // Set response headers to ensure JSON
    res.setHeader('Content-Type', 'application/json');

    try {
      // Validate request body exists
      if (!req.body || Object.keys(req.body).length === 0) {
        console.log('❌ Empty request body');
        return res.status(400).json({ 
          success: false,
          message: 'Request body is empty' 
        });
      }

      const {
        username,
        email,
        password,
        firstName,
        lastName,
        badgeNumber,
        department,
        position,
        phone,
        role = 'user'
      } = req.body;

      // Validate required fields
      if (!username || !email || !password || !firstName || !lastName) {
        console.log('❌ Missing required fields');
        return res.status(400).json({ 
          success: false,
          message: 'Missing required fields: username, email, password, firstName, lastName' 
        });
      }

      // Basic validation
      if (password.length < 6) {
        console.log('❌ Password too short');
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        console.log('❌ Invalid email format');
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Use the actual MongoDB UsersCRUD
      let UsersCRUD;
      try {
        const module = await import('./mongodb-crud.js');
        UsersCRUD = module.UsersCRUD;
      } catch (importError) {
        console.error('❌ Failed to import MongoDB CRUD:', importError);
        return res.status(500).json({
          success: false,
          message: 'Database module unavailable'
        });
      }

      // Check if user already exists
      let existingUserByUsername, existingUserByEmail;
      try {
        existingUserByUsername = await UsersCRUD.findByUsername(username);
        existingUserByEmail = await UsersCRUD.findByEmail(email);
      } catch (dbError) {
        console.error('❌ Database lookup error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error during user lookup'
        });
      }

      if (existingUserByUsername) {
        console.log('❌ Username already exists:', username);
        return res.status(409).json({ 
          success: false,
          message: 'Username already exists' 
        });
      }

      if (existingUserByEmail) {
        console.log('❌ Email already exists:', email);
        return res.status(409).json({ 
          success: false,
          message: 'Email already exists' 
        });
      }

      // Hash password
      const saltRounds = 10;
      let hashedPassword;
      try {
        hashedPassword = await bcrypt.hash(password, saltRounds);
      } catch (hashError) {
        console.error('❌ Password hashing error:', hashError);
        return res.status(500).json({
          success: false,
          message: 'Error processing password'
        });
      }

      // Create new user
      const userData = {
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        isActive: true
      };

      // Add optional fields if provided
      if (badgeNumber) userData.badgeNumber = badgeNumber;
      if (department) userData.department = department;
      if (position) userData.position = position;
      if (phone) userData.phone = phone;

      let savedUser;
      try {
        savedUser = await UsersCRUD.create(userData);
        console.log('✅ User registered successfully:', savedUser.username);
      } catch (createError) {
        console.error('❌ User creation error:', createError);
        
        // Handle specific MongoDB errors
        if (createError.code === 11000) {
          const field = Object.keys(createError.keyPattern || {})[0];
          return res.status(409).json({
            success: false,
            message: `${field || 'Field'} already exists`
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Failed to create user'
        });
      }

      // Return user without password
      const userResponse = {
        id: savedUser._id.toString(),
        _id: savedUser._id.toString(),
        username: savedUser.username,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        badgeNumber: savedUser.badgeNumber,
        department: savedUser.department,
        position: savedUser.position,
        phone: savedUser.phone,
        role: savedUser.role,
        isActive: savedUser.isActive,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt
      };

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: userResponse
      });

    } catch (error) {
      console.error('❌ Registration error:', error);

      // Ensure we always return JSON
      try {
        // Handle specific MongoDB errors
        if (error.code === 11000) {
          const field = Object.keys(error.keyPattern || {})[0];
          return res.status(409).json({
            success: false,
            message: `${field || 'Field'} already exists`
          });
        }

        // Handle MongoDB connection errors
        if (error.name === 'MongoError' || error.name === 'MongoServerError') {
          return res.status(503).json({
            success: false,
            message: 'Database connection error. Please try again later.'
          });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
          return res.status(400).json({
            success: false,
            message: 'Invalid input data'
          });
        }

        // Generic error response
        res.status(500).json({
          success: false,
          message: error.message || 'Registration failed due to server error'
        });
      } catch (responseError) {
        console.error('❌ Error sending error response:', responseError);
        // Last resort - try to send something
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Internal server error'
          });
        }
      }
    }
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { username } = forgotPasswordSchema.parse(req.body);

      const user = await effectiveStorage.getUserByUsername(username);
      if (!user) {
        // Don't reveal if user exists or not
        return res.json({ message: "If the username exists, a reset token has been generated" });
      }

      const token = randomBytes(32).toString('hex');
      // Assuming storage has a method to create password reset token
      if (effectiveStorage.createPasswordResetToken) {
        await effectiveStorage.createPasswordResetToken(user.id, token);
      } else {
        console.warn("storage.createPasswordResetToken not implemented");
      }


      // In production, send email here
      // For development, return the token
      res.json({ 
        message: "Password reset token generated",
        token // Remove this in production
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      if (error.name === 'ZodError') {
        const errorMessages = error.errors.map(e => e.message).join(', ');
        return res.status(400).json({ message: `Invalid input: ${errorMessages}` });
      }
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);

      // Assuming storage has methods to get and delete password reset tokens
      let resetData = null;
      if (effectiveStorage.getPasswordResetToken) {
        resetData = await effectiveStorage.getPasswordResetToken(token);
      } else {
        console.warn("storage.getPasswordResetToken not implemented");
      }

      if (!resetData) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      // Assuming storage has a method to update user password
      if (effectiveStorage.updateUserPassword) {
        await effectiveStorage.updateUserPassword(resetData.userId, password);
      } else {
        console.warn("storage.updateUserPassword not implemented");
      }

      if (effectiveStorage.deletePasswordResetToken) {
        await effectiveStorage.deletePasswordResetToken(token);
      } else {
        console.warn("storage.deletePasswordResetToken not implemented");
      }


      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error('Reset password error:', error);
      if (error.name === 'ZodError') {
        const errorMessages = error.errors.map(e => e.message).join(', ');
        return res.status(400).json({ message: `Invalid input: ${errorMessages}` });
      }
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie('police.sid'); // Clear the session cookie
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/me', async (req, res) => {
    // Return default admin user if no session, otherwise use session user
    const userId = req.session?.userId;
    let user = null;

    if (userId) {
      try {
        // Try to get user from MongoDB first
        const { UsersCRUD } = await import('./mongodb-crud.js');
        user = await UsersCRUD.findById(userId);
      } catch (mongoError) {
        console.log('MongoDB user lookup failed for /me, trying storage:', mongoError.message);
      }
      
      // Fallback to storage if not found in MongoDB
      if (!user) {
        user = await effectiveStorage.getUser(userId);
      }
    } else {
      // If no session, provide a default guest or admin view if applicable
      // For simplicity, let's return null or a guest object
      user = { id: 'guest', username: 'Guest', role: 'guest', firstName: 'Guest', lastName: 'User' };
    }


    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // Profile routes
  app.put('/api/profile', async (req, res) => {
    try {
      const updates = updateProfileSchema.parse(req.body);
      const userId = req.session?.userId; // Ensure user is logged in
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Update user in MongoDB if possible
      let updatedUser = null;
      try {
        const { UsersCRUD } = await import('./mongodb-crud.js');
        updatedUser = await UsersCRUD.update(userId, updates);
      } catch (mongoError) {
        console.log('MongoDB user update failed, trying storage:', mongoError.message);
        // Fallback to storage if MongoDB update fails or is not applicable
        if (effectiveStorage.updateUser) {
          updatedUser = await effectiveStorage.updateUser(userId, updates);
        }
      }


      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Update profile error:', error);
      if (error.name === 'ZodError') {
        const errorMessages = error.errors.map(e => e.message).join(', ');
        return res.status(400).json({ message: `Invalid input: ${errorMessages}` });
      }
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  // User management routes
  app.get('/api/users', async (req, res) => {
    try {
      console.log('🔍 Fetching all users from MongoDB...');
      const { UsersCRUD } = await import('./mongodb-crud.js');
      const users = await UsersCRUD.findAll();

      console.log('📊 Found users in MongoDB:', users.length, 'records');

      // Remove passwords from response and format properly
      const usersWithId = users.map(user => ({
        ...user,
        id: user._id.toString(),
        _id: user._id.toString(),
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        badgeNumber: user.badgeNumber || '',
        department: user.department || '',
        position: user.position || '',
        phone: user.phone || '',
        role: user.role || 'user',
        isActive: user.isActive !== undefined ? user.isActive : true,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));

      res.json({ users: usersWithId });
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      res.status(500).json({ 
        message: 'Failed to fetch users',
        error: error.message 
      });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      console.log('🗑️ Attempting to delete user with ID:', userId);

      // Ensure UsersCRUD is available
      const { UsersCRUD } = await import('./mongodb-crud.js');

      // Check if user exists and get user data
      const user = await UsersCRUD.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Prevent deletion of admin account
      if (user.username === 'admin') {
        return res.status(400).json({ message: "Cannot delete admin account" });
      }

      const deleted = await UsersCRUD.delete(userId);

      if (deleted) {
        console.log('✅ User deleted successfully:', user.username);
        res.json({ message: "User deleted successfully" });
      } else {
        // This case might be redundant if findById already returned null
        res.status(404).json({ message: "User not found after delete attempt" });
      }
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Cases endpoint - REMOVED

  // OB Entry routes - using MongoDB
  app.get('/api/ob-entries', async (req, res) => {
    try {
      const { OBEntriesCRUD } = await import('./mongodb-crud.js');
      const obEntries = await OBEntriesCRUD.findAll();
      console.log('📊 Raw OB entries from MongoDB:', obEntries.length, 'entries found');

      // Transform MongoDB data to match frontend expectations
      const transformedEntries = obEntries.map(entry => {
        const transformed = {
          id: entry._id.toString(),
          obNumber: entry.obNumber || `OB-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          type: entry.type || 'Incident',
          description: entry.description || '',
          reportedBy: entry.reportedBy || '',
          officer: entry.officer || 'Officer Smith',
          dateTime: entry.dateTime || entry.createdAt?.toISOString() || new Date().toISOString(),
          date: entry.date || (entry.createdAt ? entry.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
          time: entry.time || (entry.createdAt ? entry.createdAt.toTimeString().split(' ')[0] : new Date().toTimeString().split(' ')[0]),
          status: entry.status || 'Pending',
          recordingOfficerId: entry.recordingOfficerId || 1,
          location: entry.location || '',
          details: entry.details || '',
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt
        };
        return transformed;
      });

      console.log('🔄 Transformed OB entries:', transformedEntries.length);
      res.json({ obEntries: transformedEntries });
    } catch (error) {
      console.error('Error fetching OB entries:', error);
      res.status(500).json({ message: 'Failed to fetch OB entries' });
    }
  });

  app.post('/api/ob-entries', async (req, res) => {
    try {
      const obData = insertOBSchema.parse(req.body);
      const { OBEntriesCRUD } = await import('./mongodb-crud.js');

      console.log('🔍 Creating OB entry with data:', obData);

      // Generate OB number if not provided
      const obNumber = obData.obNumber || `OB-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const entryToCreate = {
        ...obData,
        obNumber,
        dateTime: obData.dateTime || new Date().toISOString(),
        date: obData.date || new Date().toISOString().split('T')[0],
        time: obData.time || new Date().toTimeString().split(' ')[0],
        status: obData.status || 'Pending',
        recordingOfficerId: req.session?.userId || 1 // Default to logged-in user or admin
      };

      console.log('📝 OB entry to create:', entryToCreate);

      const newOBEntry = await OBEntriesCRUD.create(entryToCreate);

      console.log('✅ Created OB entry in MongoDB:', newOBEntry);

      // Transform response to match frontend expectations
      const transformedEntry = {
        id: newOBEntry._id.toString(),
        obNumber: newOBEntry.obNumber,
        type: newOBEntry.type,
        description: newOBEntry.description,
        reportedBy: newOBEntry.reportedBy,
        officer: newOBEntry.officer,
        dateTime: newOBEntry.dateTime,
        date: newOBEntry.date,
        time: newOBEntry.time,
        status: newOBEntry.status,
        location: newOBEntry.location,
        details: newOBEntry.details,
        recordingOfficerId: newOBEntry.recordingOfficerId,
        createdAt: newOBEntry.createdAt,
        updatedAt: newOBEntry.updatedAt
      };

      res.status(201).json({ obEntry: transformedEntry });
    } catch (error) {
      console.error('Error creating OB entry:', error);
      if (error.name === 'ZodError') {
        const errorMessages = error.errors.map(e => e.message).join(', ');
        return res.status(400).json({ message: `Invalid input: ${errorMessages}`, error: error.message });
      }
      res.status(400).json({ message: "Invalid input", error: error.message });
    }
  });

  app.put('/api/ob-entries/:id', async (req, res) => {
    try {
      const updates = req.body;
      const { OBEntriesCRUD } = await import('./mongodb-crud.js');
      console.log('🔄 Updating OB entry:', req.params.id, 'with data:', updates);
      const updated = await OBEntriesCRUD.update(req.params.id, updates);
      if (!updated) {
        return res.status(404).json({ message: "OB Entry not found" });
      }
      console.log('✅ OB entry updated successfully');
      res.json({ message: "OB Entry updated successfully" });
    } catch (error) {
      console.error('Error updating OB entry:', error);
      res.status(404).json({ message: "OB Entry not found" });
    }
  });

  app.delete('/api/ob-entries/:id', async (req, res) => {
    try {
      const { OBEntriesCRUD } = await import('./mongodb-crud.js');
      console.log('🗑️ Deleting OB entry:', req.params.id);
      const deleted = await OBEntriesCRUD.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "OB Entry not found" });
      }
      console.log('✅ OB entry deleted successfully');
      res.json({ message: "OB Entry deleted successfully" });
    } catch (error) {
      console.error('Error deleting OB entry:', error);
      res.status(500).json({ message: "Failed to delete OB entry" });
    }
  });

  // License Plate routes
  app.get('/api/license-plates', async (req, res) => {
    try {
      const licensePlates = await effectiveStorage.getLicensePlates();
      res.json({ licensePlates });
    } catch (error) {
      console.error('Error fetching license plates:', error);
      res.status(500).json({ message: 'Failed to fetch license plates' });
    }
  });

  app.get('/api/license-plates/search/:plateNumber', async (req, res) => {
    const plateNumber = req.params.plateNumber;
    try {
      const licensePlate = await effectiveStorage.getLicensePlateByNumber(plateNumber);

      if (!licensePlate) {
        return res.status(404).json({ message: "License plate not found" });
      }

      res.json({ licensePlate });
    } catch (error) {
      console.error(`Error searching license plate ${plateNumber}:`, error);
      res.status(500).json({ message: 'Failed to search license plate' });
    }
  });

  app.post('/api/license-plates', async (req, res) => {
    try {
      const plateData = insertLicensePlateSchema.parse(req.body);
      const newPlate = await effectiveStorage.createLicensePlate({
        ...plateData,
        addedById: req.session?.userId || 1 // Default to logged-in user or admin
      });
      res.status(201).json({ licensePlate: newPlate });
    } catch (error) {
      console.error('Create license plate error:', error);
      if (error.name === 'ZodError') {
        const errorMessages = error.errors.map(e => e.message).join(', ');
        return res.status(400).json({ message: `Invalid input: ${errorMessages}` });
      }
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.put('/api/license-plates/:id', async (req, res) => {
    try {
      const plateId = parseInt(req.params.id);
      const updates = req.body; // Consider schema validation for updates
      const updatedPlate = await effectiveStorage.updateLicensePlate(plateId, updates);
      res.json({ licensePlate: updatedPlate });
    } catch (error) {
      console.error(`Update license plate ${req.params.id} error:`, error);
      res.status(404).json({ message: "License plate not found" });
    }
  });

  app.delete('/api/license-plates/:id', async (req, res) => {
    try {
      const plateId = parseInt(req.params.id);
      await effectiveStorage.deleteLicensePlate(plateId);
      res.json({ message: "License plate deleted successfully" });
    } catch (error) {
      console.error(`Delete license plate ${req.params.id} error:`, error);
      res.status(404).json({ message: "License plate not found" });
    }
  });

  // Cases endpoint - REMOVED

  // Evidence routes
  app.get('/api/evidence', async (req, res) => {
    try {
      const evidence = await effectiveStorage.getEvidence();
      res.json({ evidence });
    } catch (error) {
      console.error('Error fetching evidence:', error);
      res.status(500).json({ message: 'Failed to fetch evidence' });
    }
  });

  app.get('/api/evidence/:id', async (req, res) => {
    try {
      const evidenceItem = await effectiveStorage.getEvidenceItem(parseInt(req.params.id));
      if (!evidenceItem) {
        return res.status(404).json({ message: 'Evidence not found' });
      }
      res.json(evidenceItem);
    } catch (error) {
      console.error(`Error fetching evidence item ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch evidence' });
    }
  });

  app.post('/api/evidence', async (req, res) => {
    try {
      const evidenceData = insertEvidenceSchema.parse(req.body);
      const newEvidence = await effectiveStorage.createEvidence({
        ...evidenceData,
        addedById: req.session?.userId || 1 // Default to logged-in user or admin
      });
      res.status(201).json(newEvidence);
    } catch (error) {
      console.error('Create evidence error:', error);
      if (error.name === 'ZodError') {
        const errorMessages = error.errors.map(e => e.message).join(', ');
        return res.status(400).json({ message: `Invalid input: ${errorMessages}` });
      }
      res.status(400).json({ message: 'Invalid evidence data' });
    }
  });

  app.put('/api/evidence/:id', async (req, res) => {
    try {
      const evidenceData = insertEvidenceSchema.parse(req.body); // Reusing schema for updates
      const updatedEvidence = await effectiveStorage.updateEvidence(parseInt(req.params.id), evidenceData);
      res.json(updatedEvidence);
    } catch (error) {
      console.error(`Update evidence ${req.params.id} error:`, error);
      if (error.name === 'ZodError') {
        const errorMessages = error.errors.map(e => e.message).join(', ');
        return res.status(400).json({ message: `Invalid input: ${errorMessages}` });
      }
      res.status(400).json({ message: 'Failed to update evidence' });
    }
  });

  app.delete('/api/evidence/:id', async (req, res) => {
    try {
      await effectiveStorage.deleteEvidence(parseInt(req.params.id));
      res.json({ message: 'Evidence deleted successfully' });
    } catch (error) {
      console.error(`Delete evidence ${req.params.id} error:`, error);
      res.status(500).json({ message: 'Failed to delete evidence' });
    }
  });

  // Geofiles routes
  app.get('/api/geofiles', async (req, res) => {
    try {
      const { search, type, tags, accessLevel, dateFrom, dateTo } = req.query;
      const geofiles = await effectiveStorage.getGeofiles({
        search,
        fileType: type,
        tags: tags ? tags.split(',') : undefined,
        accessLevel,
        dateFrom,
        dateTo
      });
      res.json({ geofiles });
    } catch (error) {
      console.error('Error fetching geofiles:', error);
      res.status(500).json({ message: 'Failed to fetch geofiles' });
    }
  });

  app.get('/api/geofiles/:id', async (req, res) => {
    try {
      const geofile = await effectiveStorage.getGeofile(parseInt(req.params.id));
      if (!geofile) {
        return res.status(404).json({ message: 'Geofile not found' });
      }

      // Update last accessed time for analytics
      await effectiveStorage.updateGeofileAccess(parseInt(req.params.id));

      res.json(geofile);
    } catch (error) {
      console.error(`Error fetching geofile ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch geofile' });
    }
  });

  app.get('/api/geofiles/:id/download', async (req, res) => {
    try {
      const geofile = await effectiveStorage.getGeofile(parseInt(req.params.id));
      if (!geofile) {
        return res.status(404).json({ message: 'Geofile not found' });
      }

      // Increment download count
      await effectiveStorage.incrementGeofileDownload(parseInt(req.params.id));

      // Provide download information
      res.json({ 
        downloadUrl: geofile.fileUrl || geofile.filepath,
        filename: geofile.filename,
        fileType: geofile.fileType,
        fileSize: geofile.fileSize 
      });
    } catch (error) {
      console.error(`Error downloading geofile ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to download geofile' });
    }
  });

  app.get('/api/geofiles/search/by-location', async (req, res) => {
    try {
      const { lat, lng, radius } = req.query;
      if (!lat || !lng) {
        return res.status(400).json({ message: 'Latitude and longitude required' });
      }

      const geofiles = await effectiveStorage.searchGeofilesByLocation(
        parseFloat(lat), 
        parseFloat(lng), 
        parseFloat(radius) || 1000 // Default 1km radius
      );
      res.json({ geofiles });
    } catch (error) {
      console.error('Error searching geofiles by location:', error);
      res.status(500).json({ message: 'Failed to search geofiles by location' });
    }
  });

  app.post('/api/geofiles', async (req, res) => {
    try {
      const geofileData = {
        ...req.body,
        uploadedBy: req.session?.userId || 1, // Default to logged-in user or admin
        lastAccessedAt: new Date(),
        downloadCount: 0
      };

      // Validate file type
      const allowedTypes = ['kml', 'gpx', 'shp', 'geojson', 'kmz', 'gml', 'other'];
      if (!geofileData.fileType || !allowedTypes.includes(geofileData.fileType.toLowerCase())) {
        return res.status(400).json({ message: 'Invalid file type provided or file type is missing' });
      }

      const newGeofile = await effectiveStorage.createGeofile(geofileData);
      res.status(201).json(newGeofile);
    } catch (error) {
      console.error('Create geofile error:', error);
      if (error.name === 'ZodError') {
        const errorMessages = error.errors.map(e => e.message).join(', ');
        return res.status(400).json({ message: `Invalid input: ${errorMessages}` });
      }
      res.status(400).json({ message: 'Invalid geofile data' });
    }
  });

  app.put('/api/geofiles/:id', async (req, res) => {
    try {
      const geofileData = req.body; // Consider schema validation for updates
      const updatedGeofile = await effectiveStorage.updateGeofile(parseInt(req.params.id), geofileData);
      res.json(updatedGeofile);
    } catch (error) {
      console.error(`Update geofile ${req.params.id} error:`, error);
      res.status(400).json({ message: 'Failed to update geofile' });
    }
  });

  app.delete('/api/geofiles/:id', async (req, res) => {
    try {
      await effectiveStorage.deleteGeofile(parseInt(req.params.id));
      res.json({ message: 'Geofile deleted successfully' });
    } catch (error) {
      console.error(`Delete geofile ${req.params.id} error:`, error);
      res.status(500).json({ message: 'Failed to delete geofile' });
    }
  });

  app.post('/api/geofiles/:id/link-case/:caseId', async (req, res) => {
    try {
      const geofileId = parseInt(req.params.id);
      const caseId = parseInt(req.params.caseId);
      await effectiveStorage.linkGeofileToCase(geofileId, caseId);
      res.json({ message: 'Geofile linked to case successfully' });
    } catch (error) {
      console.error(`Link geofile ${req.params.id} to case ${req.params.caseId} error:`, error);
      res.status(400).json({ message: 'Failed to link geofile to case' });
    }
  });

  app.post('/api/geofiles/:id/add-tags', async (req, res) => {
    try {
      const geofileId = parseInt(req.params.id);
      const { tags } = req.body;
      if (!tags || !Array.isArray(tags)) {
        return res.status(400).json({ message: 'Tags must be an array' });
      }
      await effectiveStorage.addGeofileTags(geofileId, tags);
      res.json({ message: 'Tags added successfully' });
    } catch (error) {
      console.error(`Add tags to geofile ${req.params.id} error:`, error);
      res.status(400).json({ message: 'Failed to add tags' });
    }
  });

  // Reports routes
  app.get('/api/reports', async (req, res) => {
    try {
      const reports = await effectiveStorage.getReports();
      res.json({ reports });
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ message: 'Failed to fetch reports' });
    }
  });

  app.get('/api/reports/:id', async (req, res) => {
    try {
      const report = await effectiveStorage.getReport(parseInt(req.params.id));
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      res.json(report);
    } catch (error) {
      console.error(`Error fetching report ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch report' });
    }
  });

  app.post('/api/reports', async (req, res) => {
    try {
      const reportData = insertReportSchema.parse(req.body);
      const newReport = await effectiveStorage.createReport({
        ...reportData,
        requestedBy: req.session?.userId || 1 // Default to logged-in user or admin
      });
      res.status(201).json(newReport);
    } catch (error) {
      console.error('Create report error:', error);
      if (error.name === 'ZodError') {
        const errorMessages = error.errors.map(e => e.message).join(', ');
        return res.status(400).json({ message: `Invalid input: ${errorMessages}` });
      }
      res.status(400).json({ message: 'Invalid report data' });
    }
  });

  app.put('/api/reports/:id', async (req, res) => {
    try {
      const reportData = insertReportSchema.parse(req.body); // Reusing schema for updates
      const updatedReport = await effectiveStorage.updateReport(parseInt(req.params.id), reportData);
      res.json(updatedReport);
    } catch (error) {
      console.error(`Update report ${req.params.id} error:`, error);
      if (error.name === 'ZodError') {
        const errorMessages = error.errors.map(e => e.message).join(', ');
        return res.status(400).json({ message: `Invalid input: ${errorMessages}` });
      }
      res.status(400).json({ message: 'Failed to update report' });
    }
  });

  app.delete('/api/reports/:id', async (req, res) => {
    try {
      await effectiveStorage.deleteReport(parseInt(req.params.id));
      res.json({ message: 'Report deleted successfully' });
    } catch (error) {
      console.error(`Delete report ${req.params.id} error:`, error);
      res.status(500).json({ message: 'Failed to delete report' });
    }
  });

  // Police Vehicles routes
  app.get('/api/police-vehicles', async (req, res) => {
    try {
      const vehicles = await effectiveStorage.getPoliceVehicles();
      res.json(vehicles);
    } catch (error) {
      console.error('Error fetching police vehicles:', error);
      res.status(500).json({ message: 'Failed to fetch police vehicles' });
    }
  });

  app.get('/api/police-vehicles/:id', async (req, res) => {
    try {
      const vehicle = await effectiveStorage.getPoliceVehicle(parseInt(req.params.id));
      if (!vehicle) {
        return res.status(404).json({ message: 'Police vehicle not found' });
      }
      res.json(vehicle);
    } catch (error) {
      console.error(`Error fetching police vehicle ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch police vehicle' });
    }
  });

  app.post('/api/police-vehicles', async (req, res) => {
    try {
      const vehicleData = insertPoliceVehicleSchema.parse(req.body);
      const newVehicle = await effectiveStorage.createPoliceVehicle(vehicleData);
      res.status(201).json(newVehicle);
    } catch (error) {
      console.error('Create police vehicle error:', error);
      if (error.name === 'ZodError') {
        const errorMessages = error.errors.map(e => e.message).join(', ');
        return res.status(400).json({ message: `Invalid input: ${errorMessages}` });
      }
      res.status(400).json({ message: 'Invalid police vehicle data' });
    }
  });

  app.put('/api/police-vehicles/:id', async (req, res) => {
    try {
      const vehicleData = insertPoliceVehicleSchema.parse(req.body); // Reusing schema for updates
      const updatedVehicle = await effectiveStorage.updatePoliceVehicle(parseInt(req.params.id), vehicleData);
      res.json(updatedVehicle);
    } catch (error) {
      console.error(`Update police vehicle ${req.params.id} error:`, error);
      if (error.name === 'ZodError') {
        const errorMessages = error.errors.map(e => e.message).join(', ');
        return res.status(400).json({ message: `Invalid input: ${errorMessages}` });
      }
      res.status(400).json({ message: 'Failed to update police vehicle' });
    }
  });

  app.patch('/api/police-vehicles/:id/location', async (req, res) => {
    try {
      const { location } = req.body;
      if (!location || !Array.isArray(location) || location.length !== 2) {
        return res.status(400).json({ message: 'Invalid location format. Expected [longitude, latitude]' });
      }
      const updatedVehicle = await effectiveStorage.updateVehicleLocation(parseInt(req.params.id), location);
      res.json(updatedVehicle);
    } catch (error) {
      console.error(`Update vehicle ${req.params.id} location error:`, error);
      res.status(400).json({ message: 'Failed to update vehicle location' });
    }
  });

  app.patch('/api/police-vehicles/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !['available', 'on_patrol', 'responding', 'out_of_service'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be one of: available, on_patrol, responding, out_of_service' });
      }
      const updatedVehicle = await effectiveStorage.updateVehicleStatus(parseInt(req.params.id), status);
      res.json(updatedVehicle);
    } catch (error) {
      console.error(`Update vehicle ${req.params.id} status error:`, error);
      res.status(400).json({ message: 'Failed to update vehicle status' });
    }
  });

  app.delete('/api/police-vehicles/:id', async (req, res) => {
    try {
      await effectiveStorage.deletePoliceVehicle(parseInt(req.params.id));
      res.json({ message: 'Police vehicle deleted successfully' });
    } catch (error) {
      console.error(`Delete police vehicle ${req.params.id} error:`, error);
      res.status(500).json({ message: 'Failed to delete police vehicle' });
    }
  });

  // Register MongoDB API routes (with /api/mongo prefix)
  registerMongoDBRoutes(app);

  const server = createServer(app);
  return server;
}