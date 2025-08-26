// MongoDB-based API routes for Police Management System
import {
  OBEntriesCRUD,
  LicensePlatesCRUD,
  EvidenceCRUD,
  PoliceVehiclesCRUD,
  GeofilesCRUD,
  OfficersCRUD,
  ReportsCRUD,
  UsersCRUD
} from './mongodb-crud.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

// Assume getDatabase and ObjectId are available from a MongoDB connection module
// For demonstration purposes, we'll mock them here. In a real app, you'd import them.
const getDatabase = () => {
  // Replace with your actual database connection logic
  console.log('Mock getDatabase called');
  return {
    collection: (name) => ({
      find: () => ({ toArray: async () => [] }),
      findOne: async () => null,
      insertOne: async () => ({ insertedId: 'mockId' }),
      updateOne: async () => ({ matchedCount: 0 }),
      deleteOne: async () => ({ deletedCount: 0 }),
    }),
  };
};
const ObjectId = (id) => id; // Mock ObjectId

// Email configuration
const createEmailTransporter = () => {
  // You can configure this with your email service
  // For development, you can use Gmail with app passwords
  // For production, use a proper email service like SendGrid, Mailgun, etc.

  return nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com', // Set in environment
      pass: process.env.EMAIL_PASS || 'your-app-password'     // Set in environment
    }
  });
};

// Function to send reset password email
const sendResetPasswordEmail = async (email, firstName, resetToken) => {
  const transporter = createEmailTransporter();

  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@police-system.com',
    to: email,
    subject: 'Police Management System - Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1f2e, #2a3441); padding: 20px; text-align: center;">
          <h1 style="color: #4CAF50; margin: 0;">🛡️ Police Management System</h1>
        </div>

        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Password Reset Request</h2>

          <p>Hello ${firstName},</p>

          <p>You have requested to reset your password for the Police Management System. Use the reset token below to create a new password:</p>

          <div style="background-color: #e8f5e8; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <h3 style="color: #2e7d32; margin: 0 0 10px 0;">Reset Token</h3>
            <code style="font-size: 18px; font-weight: bold; color: #1b5e20; letter-spacing: 2px;">${resetToken}</code>
          </div>

          <p><strong>Important:</strong></p>
          <ul style="color: #666;">
            <li>This token will expire in 1 hour</li>
            <li>Copy and paste the token exactly as shown</li>
            <li>If you didn't request this reset, please ignore this email</li>
            <li>Contact your system administrator if you have concerns</li>
          </ul>

          <p>For security reasons, please do not share this token with anyone.</p>

          <p>Best regards,<br>Police Management System</p>
        </div>

        <div style="background-color: #333; color: #999; padding: 15px; text-align: center; font-size: 12px;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export function registerMongoDBRoutes(app, upload, uploadCustodial) {
  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await UsersCRUD.findByUsername(username);

      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Invalid credentials or account disabled' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      req.session.userId = user._id.toString();
      req.session.user = {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      };

      res.json({
        user: {
          id: user._id.toString(),
          username: user.username,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          badgeNumber: user.badgeNumber
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json({ user: req.session.user });
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      console.log('🔐 Registration attempt with data:', req.body);

      const { username, email, password, confirmPassword, ...otherData } = req.body;

      // Validate required fields
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, and password are required'
        });
      }

      // Validate password match
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Passwords do not match'
        });
      }

      // Check if user already exists
      const existingUser = await UsersCRUD.findByUsername(username);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user data
      const userData = {
        username,
        email,
        password: hashedPassword,
        firstName: otherData.firstName || '',
        lastName: otherData.lastName || '',
        badgeNumber: otherData.badgeNumber || '',
        department: otherData.department || '',
        position: otherData.position || '',
        phone: otherData.phone || '',
        role: otherData.role || 'user',
        isActive: true
      };

      const newUser = await UsersCRUD.create(userData);
      console.log('✅ User registered successfully:', newUser.username);

      // Return user without password
      const userResponse = {
        id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        badgeNumber: newUser.badgeNumber,
        department: newUser.department,
        position: newUser.position,
        phone: newUser.phone,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      };

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: userResponse
      });

    } catch (error) {
      console.error('❌ Registration error:', error);

      // Handle MongoDB duplicate key errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0];
        return res.status(409).json({
          success: false,
          message: `${field || 'Field'} already exists`
        });
      }

      res.status(500).json({
        success: false,
        message: 'Registration failed due to server error'
      });
    }
  });

  // Forgot Password Route
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { username } = req.body;
      console.log('🔍 Forgot password request for:', username);

      // Find user by username first, then try badge number if not found
      let user = await UsersCRUD.findByUsername(username);
      
      if (!user) {
        // If not found by username, try to find by badge number
        const allUsers = await UsersCRUD.findAll();
        user = allUsers.find(u => u.badgeNumber === username);
      }

      if (!user) {
        console.log('❌ User not found for forgot password:', username);
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate reset token
      const resetToken = Math.random().toString(36).substring(2, 15) +
                        Math.random().toString(36).substring(2, 15);

      // Store reset token with expiration (1 hour)
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      await UsersCRUD.update(user._id, {
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry
      });

      // Send email with reset token
      try {
        await sendResetPasswordEmail(user.email, user.firstName, resetToken);
        console.log('✅ Reset password email sent to:', user.email);
        res.json({
          message: 'Password reset instructions have been sent to your email address.',
          emailSent: true
        });
      } catch (emailError) {
        console.error('❌ Failed to send email, but token generated:', emailError);
        // Still provide token for development/testing
        res.json({
          message: 'Reset token generated (email failed to send)',
          token: resetToken,
          emailSent: false
        });
      }
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Reset Password Route
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password, confirmPassword } = req.body;
      console.log('🔍 Reset password request with token:', token);

      // Validate input
      if (!token || !password || !confirmPassword) {
        return res.status(400).json({ message: 'Token, password, and confirm password are required' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }

      // Find user with valid reset token
      const allUsers = await UsersCRUD.findAll();
      const user = allUsers.find(u => 
        u.resetToken === token && 
        u.resetTokenExpiry && 
        new Date(u.resetTokenExpiry) > new Date()
      );

      if (!user) {
        console.log('❌ Invalid or expired reset token:', token);
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user password and clear reset token
      await UsersCRUD.update(user._id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      });

      console.log('✅ Password reset successfully for user:', user.username);
      res.json({
        message: 'Password reset successfully. You can now login with your new password.'
      });
    } catch (error) {
      console.error('❌ Reset password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Users API Routes
  app.get('/api/users', async (req, res) => {
    try {
      console.log('🔍 Fetching all users from MongoDB...');
      const users = await UsersCRUD.findAll();
      console.log('📊 Found users in MongoDB:', users.length, 'records');

      // Remove passwords from response and format properly
      const safeUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return {
          ...userWithoutPassword,
          id: user._id.toString()
        };
      });

      res.json({ users: safeUsers });
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await UsersCRUD.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user', error: error.message });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const userData = { ...req.body };
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      const user = await UsersCRUD.create(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create user', error: error.message });
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    try {
      const updateData = { ...req.body };
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      const updated = await UsersCRUD.update(req.params.id, updateData);
      if (!updated) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    try {
      const deleted = await UsersCRUD.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
  });

  // OB Entries API Routes
  app.get('/api/ob-entries', async (req, res) => {
    try {
      console.log('🔍 Fetching all OB entries from MongoDB...');
      const obEntries = await OBEntriesCRUD.findAll();
      console.log('📊 Found OB entries in MongoDB:', obEntries.length, 'records');

      // Transform MongoDB data to match frontend expectations
      const transformedEntries = obEntries.map(entry => ({
        ...entry,
        id: entry._id.toString(),
        obNumber: entry.obNumber || `OB-${new Date().getFullYear()}-${entry._id.toString().slice(-3).toUpperCase()}`,
        officer: entry.officer || 'Officer Smith'
      }));

      res.json({ obEntries: transformedEntries });
    } catch (error) {
      console.error('❌ Failed to fetch OB entries:', error);
      res.status(500).json({ message: 'Failed to fetch OB entries', error: error.message });
    }
  });

  app.post('/api/ob-entries', async (req, res) => {
    try {
      console.log('🔍 Creating new OB entry with data:', req.body);

      // Generate OB number if not provided
      const obNumber = req.body.obNumber || `OB-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const obData = {
        ...req.body,
        obNumber,
        dateTime: req.body.dateTime || new Date().toISOString(),
        date: req.body.date || new Date().toISOString().split('T')[0],
        time: req.body.time || new Date().toTimeString().split(' ')[0],
        status: req.body.status || 'Pending',
        officer: req.body.officer || 'Officer Smith',
        recordingOfficerId: 1 // Default admin user
      };

      const createdEntry = await OBEntriesCRUD.create(obData);
      console.log('✅ OB entry created successfully:', createdEntry);

      const responseEntry = {
        ...createdEntry,
        id: createdEntry._id.toString()
      };

      res.status(201).json({ obEntry: responseEntry });
    } catch (error) {
      console.error('❌ Failed to create OB entry:', error);
      res.status(500).json({ message: 'Failed to create OB entry', error: error.message });
    }
  });

  app.put('/api/ob-entries/:id', async (req, res) => {
    try {
      console.log('🔍 Updating OB entry:', req.params.id, 'with data:', req.body);
      const updated = await OBEntriesCRUD.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: 'OB entry not found' });
      }

      // Fetch the updated entry
      const updatedEntry = await OBEntriesCRUD.findById(req.params.id);
      const responseEntry = {
        ...updatedEntry,
        id: updatedEntry._id.toString()
      };

      res.json({ obEntry: responseEntry });
    } catch (error) {
      console.error('❌ Failed to update OB entry:', error);
      res.status(500).json({ message: 'Failed to update OB entry', error: error.message });
    }
  });

  app.delete('/api/ob-entries/:id', async (req, res) => {
    try {
      console.log('🗑️ Deleting OB entry:', req.params.id);
      const deleted = await OBEntriesCRUD.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'OB entry not found' });
      }
      console.log('✅ OB entry deleted successfully');
      res.json({ message: 'OB entry deleted successfully' });
    } catch (error) {
      console.error('❌ Failed to delete OB entry:', error);
      res.status(500).json({ message: 'Failed to delete OB entry', error: error.message });
    }
  });

  // License Plates API Routes
  app.get('/api/license-plates', async (req, res) => {
    try {
      console.log('🔍 Fetching all license plates from MongoDB...');
      const plates = await LicensePlatesCRUD.findAll();
      console.log('📊 Found license plates in MongoDB:', plates.length, 'records');

      res.json({ licensePlates: plates });
    } catch (error) {
      console.error('❌ Failed to fetch license plates:', error);
      res.status(500).json({ message: 'Failed to fetch license plates', error: error.message });
    }
  });

  // Add mongo prefix route for compatibility
  app.get('/api/mongo/license-plates', async (req, res) => {
    try {
      console.log('🔍 Fetching all license plates from MongoDB via /mongo endpoint...');
      const plates = await LicensePlatesCRUD.findAll();
      console.log('📊 Found license plates in MongoDB:', plates.length, 'records');

      res.json({ licensePlates: plates });
    } catch (error) {
      console.error('❌ Failed to fetch license plates:', error);
      res.status(500).json({ message: 'Failed to fetch license plates', error: error.message });
    }
  });

  app.post('/api/mongo/license-plates', async (req, res) => {
    try {
      console.log('🔍 Creating new license plate via /mongo endpoint with data:', req.body);

      const plateData = {
        ...req.body,
        addedById: 1, // Default admin user
        status: req.body.status || 'Active'
      };

      const createdPlate = await LicensePlatesCRUD.create(plateData);
      console.log('✅ License plate created successfully:', createdPlate);

      res.status(201).json({ licensePlate: createdPlate });
    } catch (error) {
      console.error('❌ Failed to create license plate:', error);
      res.status(500).json({ message: 'Failed to create license plate', error: error.message });
    }
  });

  app.get('/api/license-plates/search/:plateNumber', async (req, res) => {
    try {
      console.log('🔍 Searching for license plate:', req.params.plateNumber);
      const plate = await LicensePlatesCRUD.findByPlateNumber(req.params.plateNumber);

      if (!plate) {
        return res.status(404).json({ message: "License plate not found" });
      }

      const responsePlate = {
        ...plate,
        id: plate._id.toString()
      };

      res.json({ licensePlate: responsePlate });
    } catch (error) {
      console.error('❌ Failed to search license plate:', error);
      res.status(500).json({ message: 'Failed to search license plate', error: error.message });
    }
  });

  app.post('/api/license-plates', async (req, res) => {
    try {
      console.log('🔍 Creating new license plate with data:', req.body);

      const plateData = {
        ...req.body,
        addedById: 1, // Default admin user
        status: req.body.status || 'Active'
      };

      const createdPlate = await LicensePlatesCRUD.create(plateData);
      console.log('✅ License plate created successfully:', createdPlate);

      res.status(201).json({ licensePlate: createdPlate });
    } catch (error) {
      console.error('❌ Failed to create license plate:', error);
      res.status(500).json({ message: 'Failed to create license plate', error: error.message });
    }
  });

  app.put('/api/license-plates/:id', async (req, res) => {
    try {
      console.log('🔍 Updating license plate:', req.params.id, 'with data:', req.body);
      const updated = await LicensePlatesCRUD.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: 'License plate not found' });
      }

      // Fetch the updated plate
      const updatedPlate = await LicensePlatesCRUD.findById(req.params.id);
      const responsePlate = {
        ...updatedPlate,
        id: updatedPlate._id.toString()
      };

      res.json({ licensePlate: responsePlate });
    } catch (error) {
      console.error('❌ Failed to update license plate:', error);
      res.status(500).json({ message: 'Failed to update license plate', error: error.message });
    }
  });

  app.delete('/api/license-plates/:id', async (req, res) => {
    try {
      console.log('🗑️ Deleting license plate:', req.params.id);
      const deleted = await LicensePlatesCRUD.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'License plate not found' });
      }
      console.log('✅ License plate deleted successfully');
      res.json({ message: 'License plate deleted successfully' });
    } catch (error) {
      console.error('❌ Failed to delete license plate:', error);
      res.status(500).json({ message: 'Failed to delete license plate', error: error.message });
    }
  });

  // Evidence routes are handled in evidence-routes.js

  // Profiles API Routes (mapped to Officers for now)
  app.get('/api/profiles', async (req, res) => {
    try {
      console.log('🔍 Fetching all profiles (officers) from MongoDB...');
      const officers = await OfficersCRUD.findAll();
      console.log('📊 Found profiles in MongoDB:', officers.length, 'records');

      // Transform officers data to profiles format
      const profiles = officers.map(officer => ({
        ...officer,
        id: officer._id.toString(),
        name: `${officer.firstName} ${officer.lastName}`,
        title: officer.position || 'Officer',
        department: officer.department || 'Police Department',
        badge: officer.badgeNumber,
        contact: officer.phone || officer.email,
        status: officer.status || 'active'
      }));

      res.json({ profiles });
    } catch (error) {
      console.error('❌ Failed to fetch profiles:', error);
      res.status(500).json({ message: 'Failed to fetch profiles', error: error.message });
    }
  });

  app.get('/api/profiles/:id', async (req, res) => {
    try {
      console.log('🔍 Fetching profile by ID:', req.params.id);
      const officer = await OfficersCRUD.findById(req.params.id);

      if (!officer) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      const profile = {
        ...officer,
        id: officer._id.toString(),
        name: `${officer.firstName} ${officer.lastName}`,
        title: officer.position || 'Officer',
        department: officer.department || 'Police Department',
        badge: officer.badgeNumber,
        contact: officer.phone || officer.email,
        status: officer.status || 'active'
      };

      res.json({ profile });
    } catch (error) {
      console.error('❌ Failed to fetch profile:', error);
      res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
  });

  app.post('/api/profiles', async (req, res) => {
    try {
      console.log('🔍 Creating new profile with data:', req.body);

      // Transform profile data to officer format
      const officerData = {
        firstName: req.body.firstName || req.body.name?.split(' ')[0] || '',
        lastName: req.body.lastName || req.body.name?.split(' ').slice(1).join(' ') || '',
        badgeNumber: req.body.badge || req.body.badgeNumber || '',
        department: req.body.department || 'Police Department',
        position: req.body.title || req.body.position || 'Officer',
        email: req.body.email || '',
        phone: req.body.contact || req.body.phone || '',
        address: req.body.address || '',
        emergencyContact: req.body.emergencyContact || '',
        specialization: req.body.specialization || '',
        yearsOfService: req.body.yearsOfService || '',
        status: req.body.status || 'active'
      };

      const officer = await OfficersCRUD.create(officerData);

      const profile = {
        ...officer,
        id: officer._id.toString(),
        name: `${officer.firstName} ${officer.lastName}`,
        title: officer.position,
        department: officer.department,
        badge: officer.badgeNumber,
        contact: officer.phone || officer.email,
        status: officer.status
      };

      res.status(201).json({ profile });
    } catch (error) {
      console.error('❌ Failed to create profile:', error);
      res.status(500).json({ message: 'Failed to create profile', error: error.message });
    }
  });

  app.put('/api/profiles/:id', async (req, res) => {
    try {
      console.log('🔍 Updating profile:', req.params.id, 'with data:', req.body);

      // Transform profile data to officer format
      const updateData = {
        firstName: req.body.firstName || req.body.name?.split(' ')[0],
        lastName: req.body.lastName || req.body.name?.split(' ').slice(1).join(' '),
        badgeNumber: req.body.badge || req.body.badgeNumber,
        department: req.body.department,
        position: req.body.title || req.body.position,
        email: req.body.email,
        phone: req.body.contact || req.body.phone,
        address: req.body.address,
        emergencyContact: req.body.emergencyContact,
        specialization: req.body.specialization,
        yearsOfService: req.body.yearsOfService,
        status: req.body.status
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key =>
        updateData[key] === undefined && delete updateData[key]
      );

      const updated = await OfficersCRUD.update(req.params.id, updateData);
      if (!updated) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      // Fetch the updated officer
      const updatedOfficer = await OfficersCRUD.findById(req.params.id);
      const profile = {
        ...updatedOfficer,
        id: updatedOfficer._id.toString(),
        name: `${updatedOfficer.firstName} ${updatedOfficer.lastName}`,
        title: updatedOfficer.position,
        department: updatedOfficer.department,
        badge: updatedOfficer.badgeNumber,
        contact: updatedOfficer.phone || updatedOfficer.email,
        status: updatedOfficer.status
      };

      res.json({ profile });
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
  });

  app.delete('/api/profiles/:id', async (req, res) => {
    try {
      console.log('🗑️ Deleting profile:', req.params.id);
      const deleted = await OfficersCRUD.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      console.log('✅ Profile deleted successfully');
      res.json({ message: 'Profile deleted successfully' });
    } catch (error) {
      console.error('❌ Failed to delete profile:', error);
      res.status(500).json({ message: 'Failed to delete profile', error: error.message });
    }
  });

  // Police Vehicles API Routes
  app.get('/api/police-vehicles', async (req, res) => {
    try {
      const vehicles = await PoliceVehiclesCRUD.findAll();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch police vehicles', error: error.message });
    }
  });

  app.post('/api/police-vehicles', async (req, res) => {
    try {
      const vehicle = await PoliceVehiclesCRUD.create(req.body);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create police vehicle record', error: error.message });
    }
  });

  // Officers API Routes
  app.get('/api/officers', async (req, res) => {
    try {
      console.log('🔍 Fetching all officers from MongoDB...');
      const officers = await OfficersCRUD.findAll();
      console.log('📊 Found officers in MongoDB:', officers.length, 'records');

      const mappedOfficers = officers.map(officer => ({
        ...officer,
        id: officer._id.toString()
      }));

      res.json({ officers: mappedOfficers });
    } catch (error) {
      console.error('❌ Failed to fetch officers:', error);
      res.status(500).json({ message: 'Failed to fetch officers', error: error.message });
    }
  });

  app.post('/api/officers', async (req, res) => {
    try {
      console.log('🔍 Creating new officer with data:', req.body);
      const officer = await OfficersCRUD.create(req.body);
      const responseOfficer = {
        ...officer,
        id: officer._id.toString()
      };
      res.status(201).json({ officer: responseOfficer });
    } catch (error) {
      console.error('❌ Failed to create officer:', error);
      res.status(500).json({ message: 'Failed to create officer', error: error.message });
    }
  });

  app.put('/api/officers/:id', async (req, res) => {
    try {
      console.log('🔍 Updating officer:', req.params.id, 'with data:', req.body);
      const updated = await OfficersCRUD.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: 'Officer not found' });
      }

      // Fetch the updated officer
      const updatedOfficer = await OfficersCRUD.findById(req.params.id);
      const responseOfficer = {
        ...updatedOfficer,
        id: updatedOfficer._id.toString()
      };

      res.json({ officer: responseOfficer });
    } catch (error) {
      console.error('❌ Failed to update officer:', error);
      res.status(500).json({ message: 'Failed to update officer', error: error.message });
    }
  });

  app.delete('/api/officers/:id', async (req, res) => {
    try {
      console.log('🗑️ Deleting officer:', req.params.id);
      const deleted = await OfficersCRUD.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Officer not found' });
      }
      console.log('✅ Officer deleted successfully');
      res.json({ message: 'Officer deleted successfully' });
    } catch (error) {
      console.error('❌ Failed to delete officer:', error);
      res.status(500).json({ message: 'Failed to delete officer', error: error.message });
    }
  });

  // Geofiles API Routes
  app.get('/api/geofiles', async (req, res) => {
    try {
      console.log('🔍 Fetching geofiles with query params:', req.query);

      // Extract filter parameters
      const filters = {
        search: req.query.search,
        fileType: req.query.fileType,
        accessLevel: req.query.accessLevel,
        tags: req.query.tags ? req.query.tags.split(',') : [],
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo
      };

      const geofiles = await GeofilesCRUD.findAll(filters);
      console.log('📊 Found geofiles:', geofiles.length, 'records');

      res.json({ geofiles });
    } catch (error) {
      console.error('❌ Failed to fetch geofiles:', error);
      res.status(500).json({ message: 'Failed to fetch geofiles', error: error.message });
    }
  });

  app.get('/api/geofiles/:id', async (req, res) => {
    try {
      console.log('🔍 Fetching geofile by ID:', req.params.id);
      const geofile = await GeofilesCRUD.findById(req.params.id);

      if (!geofile) {
        return res.status(404).json({ message: 'Geofile not found' });
      }

      // Update access timestamp
      await GeofilesCRUD.updateAccess(req.params.id);

      const responseGeofile = {
        ...geofile,
        id: geofile._id.toString()
      };

      res.json({ geofile: responseGeofile });
    } catch (error) {
      console.error('❌ Failed to fetch geofile:', error);
      res.status(500).json({ message: 'Failed to fetch geofile', error: error.message });
    }
  });

  app.post('/api/geofiles', async (req, res) => {
    try {
      console.log('🔍 Creating new geofile with data:', req.body);

      const geofileData = {
        ...req.body,
        uploadedBy: req.session?.userId || 1, // Use session user or default to admin
        lastAccessedAt: new Date(),
        downloadCount: 0
      };

      // Validate required fields
      if (!geofileData.filename || !geofileData.fileType) {
        return res.status(400).json({ message: 'Filename and file type are required' });
      }

      // Validate file type
      const allowedTypes = ['shp', 'kml', 'geojson', 'csv', 'gpx', 'kmz', 'gml'];
      if (!allowedTypes.includes(geofileData.fileType.toLowerCase())) {
        return res.status(400).json({ message: 'Invalid file type. Allowed types: ' + allowedTypes.join(', ') });
      }

      const createdGeofile = await GeofilesCRUD.create(geofileData);
      console.log('✅ Geofile created successfully:', createdGeofile.id);

      res.status(201).json({ geofile: createdGeofile });
    } catch (error) {
      console.error('❌ Failed to create geofile:', error);
      res.status(500).json({ message: 'Failed to create geofile record', error: error.message });
    }
  });

  app.put('/api/geofiles/:id', async (req, res) => {
    try {
      console.log('🔍 Updating geofile:', req.params.id, 'with data:', req.body);
      const updated = await GeofilesCRUD.update(req.params.id, req.body);

      if (!updated) {
        return res.status(404).json({ message: 'Geofile not found' });
      }

      // Fetch the updated geofile
      const updatedGeofile = await GeofilesCRUD.findById(req.params.id);
      const responseGeofile = {
        ...updatedGeofile,
        id: updatedGeofile._id.toString()
      };

      console.log('✅ Geofile updated successfully');
      res.json({ geofile: responseGeofile });
    } catch (error) {
      console.error('❌ Failed to update geofile:', error);
      res.status(500).json({ message: 'Failed to update geofile', error: error.message });
    }
  });

  app.delete('/api/geofiles/:id', async (req, res) => {
    try {
      console.log('🗑️ Deleting geofile:', req.params.id);
      const deleted = await GeofilesCRUD.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({ message: 'Geofile not found' });
      }

      console.log('✅ Geofile deleted successfully');
      res.json({ message: 'Geofile deleted successfully' });
    } catch (error) {
      console.error('❌ Failed to delete geofile:', error);
      res.status(500).json({ message: 'Failed to delete geofile', error: error.message });
    }
  });

  app.post('/api/geofiles/upload', upload.single('file'), async (req, res) => {
    try {
      console.log('🔍 Uploading geofile with form data:', req.body);
      console.log('🔍 Uploaded file:', req.file);
      console.log('🔍 Form fields received:', Object.keys(req.body));
      console.log('🔍 Filename field:', req.body.filename);

      // Validate required fields
      if (!req.body.filename || req.body.filename.trim() === '') {
        console.log('❌ Validation failed: filename is missing or empty');
        return res.status(400).json({ message: 'Name/Label is required' });
      }

      // Set default file type if not provided
      const fileType = req.body.fileType || 'GEOJSON';
      const fileName = req.body.filename;

      // For now, simulate file upload without actual file storage
      const geofileData = {
        filename: fileName + '.' + fileType.toLowerCase(),
        filepath: `/geofiles/${fileName}.${fileType.toLowerCase()}`,
        fileType: fileType.toUpperCase(),
        fileSize: Math.floor(Math.random() * 100000) + 10000, // Random size for demo
        description: req.body.description || '',
        tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
        coordinateSystem: req.body.coordinateSystem || 'WGS84',
        accessLevel: req.body.accessLevel || 'internal',
        isPublic: req.body.isPublic === 'true',
        caseId: req.body.caseId || null,
        obId: req.body.obId || null,
        evidenceId: req.body.evidenceId || null,
        address: `${fileName} Location`,
        locationName: fileName,
        coordinates: JSON.stringify([-122.4194, 37.7749]), // Default SF coordinates
        boundingBox: JSON.stringify([[-122.45, 37.75], [-122.38, 37.80]]),
        metadata: JSON.stringify({
          creator: 'Police Department',
          coordinateSystem: req.body.coordinateSystem || 'WGS84',
          uploadMethod: 'web_interface'
        }),
        uploadedBy: req.session?.userId || 1,
        downloadCount: 0
      };

      const createdGeofile = await GeofilesCRUD.create(geofileData);
      console.log('✅ Geofile uploaded successfully:', createdGeofile.id);

      res.status(201).json({
        geofile: createdGeofile,
        message: 'Geofile uploaded successfully'
      });
    } catch (error) {
      console.error('❌ Failed to upload geofile:', error);
      res.status(500).json({ message: 'Failed to upload geofile', error: error.message });
    }
  });

  app.post('/api/geofiles/:id/download', async (req, res) => {
    try {
      console.log('📥 Recording download for geofile:', req.params.id);
      await GeofilesCRUD.incrementDownload(req.params.id);
      res.json({ message: 'Download recorded successfully' });
    } catch (error) {
      console.error('❌ Failed to record download:', error);
      res.status(500).json({ message: 'Failed to record download', error: error.message });
    }
  });

  app.get('/api/geofiles/stats/summary', async (req, res) => {
    try {
      console.log('📊 Fetching geofiles statistics');
      const stats = await GeofilesCRUD.getStats();
      res.json({ stats });
    } catch (error) {
      console.error('❌ Failed to fetch geofiles stats:', error);
      res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
    }
  });



  // Reports API Routes
  app.get('/api/reports', async (req, res) => {
    try {
      console.log('🔍 Fetching all reports from MongoDB...');
      const reports = await ReportsCRUD.findAll();
      console.log('📊 Found reports in MongoDB:', reports.length, 'records');

      // Transform MongoDB data to match frontend expectations
      const transformedReports = reports.map(report => ({
        ...report,
        id: report._id.toString(),
        reportNumber: report.reportNumber || `RPT-${new Date().getFullYear()}-${report._id.toString().slice(-3).toUpperCase()}`
      }));

      res.json({ reports: transformedReports });
    } catch (error) {
      console.error('❌ Failed to fetch reports:', error);
      res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
    }
  });

  app.get('/api/reports/:id', async (req, res) => {
    try {
      console.log('🔍 Fetching report by ID:', req.params.id);
      const report = await ReportsCRUD.findById(req.params.id);

      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      const responseReport = {
        ...report,
        id: report._id.toString()
      };

      res.json({ report: responseReport });
    } catch (error) {
      console.error('❌ Failed to fetch report:', error);
      res.status(500).json({ message: 'Failed to fetch report', error: error.message });
    }
  });

  app.post('/api/reports', async (req, res) => {
    try {
      console.log('🔍 Creating new report with data:', req.body);

      const reportData = {
        ...req.body,
        requestedBy: req.session?.userId || 1, // Default admin user
        status: req.body.status || 'Pending'
      };

      const createdReport = await ReportsCRUD.create(reportData);
      console.log('✅ Report created successfully:', createdGeofile);

      res.status(201).json({ report: createdReport });
    } catch (error) {
      console.error('❌ Failed to create report:', error);
      res.status(500).json({ message: 'Failed to create report', error: error.message });
    }
  });

  app.put('/api/reports/:id', async (req, res) => {
    try {
      console.log('🔍 Updating report:', req.params.id, 'with data:', req.body);
      const updated = await ReportsCRUD.update(req.params.id, req.body);

      if (!updated) {
        return res.status(404).json({ message: 'Report not found' });
      }

      // Fetch the updated report
      const updatedReport = await ReportsCRUD.findById(req.params.id);
      const responseReport = {
        ...updatedReport,
        id: updatedReport._id.toString()
      };

      res.json({ report: responseReport });
    } catch (error) {
      console.error('❌ Failed to update report:', error);
      res.status(500).json({ message: 'Failed to update report', error: error.message });
    }
  });

  app.delete('/api/reports/:id', async (req, res) => {
    try {
      console.log('🗑️ Deleting report:', req.params.id);
      const deleted = await ReportsCRUD.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({ message: 'Report not found' });
      }

      console.log('✅ Report deleted successfully');
      res.json({ message: 'Report deleted successfully' });
    } catch (error) {
      console.error('❌ Failed to delete report:', error);
      res.status(500).json({ message: 'Failed to delete report', error: error.message });
    }
  });

  // Evidence routes handled in evidence-routes.js
}