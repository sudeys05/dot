import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  badgeNumber: { type: String },
  department: { type: String },
  position: { type: String },
  phone: { type: String },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date },
  resetToken: String,
  resetTokenExpiry: Date
}, {
  timestamps: true,
  collection: 'users'
});

// Case Schema - REMOVED

// OB Entry Schema
const obEntrySchema = new mongoose.Schema({
  obNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  time: { type: Date, required: true },
  location: String,
  involvedPersons: String,
  actionTaken: String,
  reportingOfficer: String,
  createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Evidence Schema
const evidenceSchema = new mongoose.Schema({
  evidenceNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: ['Physical', 'Digital', 'Document', 'Photo', 'Video', 'Audio', 'Other'] },
  description: { type: String, required: true },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  obId: { type: mongoose.Schema.Types.ObjectId, ref: 'OBEntry' },
  location: { type: String, required: true },
  chain_of_custody: String,
  status: { type: String, enum: ['Collected', 'Analyzed', 'Stored', 'Released', 'Disposed', 'Missing'], default: 'Collected' },
  collectedBy: { type: String, required: true },
  collectedAt: { type: Date, default: Date.now },
  // Enhanced evidence tracking fields
  tags: [String], // For categorization and search
  weight: String,
  dimensions: String,
  serialNumber: String,
  condition: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'], default: 'Good' },
  storageLocation: String,
  evidenceRoom: String,
  bagsSealed: { type: Boolean, default: false },
  photographed: { type: Boolean, default: false },
  fingerprinted: { type: Boolean, default: false },
  dnaCollected: { type: Boolean, default: false },
  // Chain of custody tracking
  custodyLog: [{
    action: { type: String, required: true }, // 'collected', 'transferred', 'analyzed', etc.
    officer: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    notes: String,
    location: String
  }],
  // Media attachments
  media: [{
    name: String,
    url: String,
    type: { type: String, enum: ['photo', 'video', 'audio', 'document'] },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: String
  }],
  // Administrative fields
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  isSealed: { type: Boolean, default: false },
  disposalDate: Date,
  disposalMethod: String,
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Report Schema
const reportSchema = new mongoose.Schema({
  reportNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  obId: { type: mongoose.Schema.Types.ObjectId, ref: 'OBEntry' },
  evidenceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Evidence' },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Pending', 'Approved', 'Completed', 'Rejected'], default: 'Pending' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// License Plate Schema
const licensePlateSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, unique: true },
  ownerName: String,
  fatherName: String,
  motherName: String,
  idNumber: String,
  passportNumber: String,
  ownerImage: String,
  vehicleType: String,
  vehicleModel: String,
  vehicleColor: String,
  registrationDate: Date,
  expiryDate: Date,
  status: { type: String, enum: ['Active', 'Suspended', 'Expired'], default: 'Active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Custodial Records (Inmates) Schema
const inmateSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  prisonerNumber: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date, default: null },
  age: { type: Number, default: null },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: null },
  nationality: { type: String, default: null },
  address: String,
  idPhoto: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    uploadedAt: Date
  },
  admissionDate: { type: Date, required: true },
  charges: [String],
  sentence: String,
  courtReference: String,
  emergencyContactName: String,
  relationship: String,
  contactPhone: String,
  contactAddress: String,
  medicalConditions: String,
  allergies: String,
  doctorNotes: String,
  behaviorReports: String,
  disciplinaryActions: String,
  privileges: String,
  status: { type: String, enum: ['Active', 'Released', 'Transferred', 'Court Appearance'], default: 'Active' },
  releaseDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'inmates'
});

// Create and export models
export const User = mongoose.model('User', userSchema);
export const OBEntry = mongoose.model('OBEntry', obEntrySchema);
export const Evidence = mongoose.model('Evidence', evidenceSchema);
export const Report = mongoose.model('Report', reportSchema);
export const LicensePlate = mongoose.model('LicensePlate', licensePlateSchema);
export const Inmate = mongoose.model('Inmate', inmateSchema);