import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("user"), // "admin" or "user"
  badgeNumber: text("badge_number"),
  department: text("department"),
  position: text("position"),
  phone: text("phone"),
  profileImage: text("profile_image"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

// Cases table
export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  caseNumber: text("case_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("open"), // "open", "in_progress", "closed"
  priority: text("priority").notNull().default("medium"), // "low", "medium", "high"
  assignedOfficerId: integer("assigned_officer_id").references(() => users.id),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Occurrence Book entries
export const obEntries = pgTable("ob_entries", {
  id: serial("id").primaryKey(),
  obNumber: text("ob_number").notNull().unique(),
  dateTime: timestamp("date_time").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  reportedBy: text("reported_by").notNull(),
  recordingOfficerId: integer("recording_officer_id").references(() => users.id),
  location: text("location"),
  status: text("status").notNull().default("recorded"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// License plates
export const licensePlates = pgTable("license_plates", {
  id: serial("id").primaryKey(),
  plateNumber: text("plate_number").notNull().unique(),
  ownerName: text("owner_name").notNull(),
  fatherName: text("father_name"),
  motherName: text("mother_name"),
  idNumber: text("id_number"),
  passportNumber: text("passport_number"),
  ownerImage: text("owner_image"),
  addedById: integer("added_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Evidence log
export const evidence = pgTable("evidence", {
  id: serial("id").primaryKey(),
  evidenceNumber: text("evidence_number").notNull().unique(),
  caseId: integer("case_id").references(() => cases.id),
  obId: integer("ob_id").references(() => obEntries.id),
  type: text("type").notNull(), // "physical", "digital", "document", "photo", "video"
  description: text("description").notNull(),
  location: text("location").notNull(),
  chain_of_custody: text("chain_of_custody"),
  status: text("status").notNull().default("collected"), // "collected", "analyzed", "stored", "disposed"
  collectedBy: integer("collected_by").references(() => users.id),
  collectedAt: timestamp("collected_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Geofiles
export const geofiles = pgTable("geofiles", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => cases.id),
  obId: integer("ob_id").references(() => obEntries.id),
  evidenceId: integer("evidence_id").references(() => evidence.id),
  filename: text("filename").notNull(),
  filepath: text("filepath").notNull(),
  fileUrl: text("file_url"), // URL for downloadable files
  fileType: text("file_type").notNull(), // "kml", "gpx", "shp", "geojson", "kmz", "gml", "other"
  fileSize: integer("file_size"), // File size in bytes
  coordinates: text("coordinates"), // JSON string of coordinates
  boundingBox: text("bounding_box"), // JSON string for file geographic bounds
  address: text("address"),
  locationName: text("location_name"), // Named location reference
  description: text("description"),
  metadata: text("metadata"), // JSON string for additional file metadata
  tags: text("tags"), // JSON array of tags for categorization
  isPublic: boolean("is_public").default(false), // Public access flag
  accessLevel: text("access_level").notNull().default("internal"), // "internal", "department", "public"
  patrolArea: text("patrol_area"), // JSON string for associated patrol areas
  incidentMarkers: text("incident_markers"), // JSON string for incident locations
  uploadedBy: integer("uploaded_by").references(() => users.id),
  lastAccessedAt: timestamp("last_accessed_at"),
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Police Vehicles
export const policeVehicles = pgTable("police_vehicles", {
  id: serial("id").primaryKey(),
  vehicleId: text("vehicle_id").notNull().unique(),
  licensePlate: text("license_plate").notNull().unique(),
  vehicleType: text("vehicle_type").notNull(), // "patrol", "motorcycle", "ambulance", "k9", "special"
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  currentLocation: text("current_location"), // JSON string of coordinates
  assignedArea: text("assigned_area"), // JSON string of patrol area coordinates
  status: text("status").notNull().default("available"), // "available", "on_patrol", "responding", "out_of_service"
  assignedOfficerId: integer("assigned_officer_id").references(() => users.id),
  lastUpdate: timestamp("last_update").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reports
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reportNumber: text("report_number").notNull().unique(),
  type: text("type").notNull(), // "warranty", "incident", "evidence", "case_summary"
  caseId: integer("case_id").references(() => cases.id),
  obId: integer("ob_id").references(() => obEntries.id),
  evidenceId: integer("evidence_id").references(() => evidence.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  requestedBy: integer("requested_by").references(() => users.id),
  status: text("status").notNull().default("pending"), // "pending", "approved", "completed", "rejected"
  priority: text("priority").notNull().default("medium"), // "low", "medium", "high", "urgent"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
  badgeNumber: true,
  department: true,
  position: true,
  phone: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  badgeNumber: true,
  department: true,
  position: true,
  phone: true,
}).extend({
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const updateProfileSchema = createInsertSchema(users).pick({
  firstName: true,
  lastName: true,
  email: true,
  badgeNumber: true,
  department: true,
  position: true,
  phone: true,
}).partial();

export const insertCaseSchema = createInsertSchema(cases).pick({
  title: true,
  description: true,
  status: true,
  priority: true,
});

export const insertOBSchema = createInsertSchema(obEntries).pick({
  type: true,
  description: true,
  reportedBy: true,
  location: true,
});

export const insertLicensePlateSchema = createInsertSchema(licensePlates).pick({
  plateNumber: true,
  ownerName: true,
  fatherName: true,
  motherName: true,
  idNumber: true,
  passportNumber: true,
});

export const insertEvidenceSchema = createInsertSchema(evidence).pick({
  type: true,
  description: true,
  location: true,
  chain_of_custody: true,
  status: true,
  collectedAt: true,
});

export const insertGeofileSchema = createInsertSchema(geofiles).pick({
  filename: true,
  filepath: true,
  fileType: true,
  coordinates: true,
  address: true,
  description: true,
});

export const insertReportSchema = createInsertSchema(reports).pick({
  type: true,
  title: true,
  content: true,
  status: true,
  priority: true,
});

export const insertPoliceVehicleSchema = createInsertSchema(policeVehicles).pick({
  vehicleId: true,
  licensePlate: true,
  vehicleType: true,
  make: true,
  model: true,
  year: true,
  currentLocation: true,
  assignedArea: true,
  status: true,
});