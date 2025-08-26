import { 
  users, 
  cases,
  obEntries,
  licensePlates,
  evidence,
  geofiles,
  reports,
  passwordResetTokens,
  policeVehicles
} from "../shared/schema.js";

export class MemStorage {
  constructor() {
    this.users = new Map();
    this.cases = new Map();
    this.obEntries = new Map();
    this.licensePlates = new Map();
    this.evidence = new Map();
    this.geofiles = new Map();
    this.reports = new Map();
    this.resetTokens = new Map();
    this.policeVehicles = new Map();
    this.currentUserId = 1;
    this.currentCaseId = 1;
    this.currentOBId = 1;
    this.currentPlateId = 1;
    this.currentEvidenceId = 1;
    this.currentGeofileId = 1;
    this.currentReportId = 1;
    this.currentVehicleId = 1;
    
    // Create default admin user
    this.createDefaultAdmin();
    
    // Create default case data
    this.createDefaultCases();
    
    // Create default police vehicles
    this.createDefaultVehicles();
    
    // Create default geofiles
    this.createDefaultGeofiles();
  }

  async createDefaultAdmin() {
    console.log('⚠️ Default admin user creation has been disabled for security reasons');
    console.log('ℹ️ Please create admin users through the registration system');
    // Default admin creation removed for security
  }

  async createDefaultCases() {
    // Create sample cases
    const sampleCases = [
      {
        title: 'Burglary at Main Street Store',
        description: 'Break-in occurred at electronics store on Main Street. Several items reported missing including laptops and phones.',
        type: 'Burglary',
        priority: 'High',
        status: 'In Progress',
        incidentDate: '2025-01-20T10:30:00Z',
        location: 'Main Street Electronics Store, Downtown',
        assignedOfficer: 'Officer Johnson',
        createdById: 1
      },
      {
        title: 'Traffic Accident Investigation',
        description: 'Multi-vehicle accident at highway intersection. Minor injuries reported.',
        type: 'Traffic',
        priority: 'Medium',
        status: 'Open',
        incidentDate: '2025-01-21T15:45:00Z',
        location: 'Highway 101 & Oak Avenue Intersection',
        assignedOfficer: 'Officer Davis',
        createdById: 1
      },
      {
        title: 'Missing Person Report',
        description: 'Adult male reported missing by family. Last seen at work on Friday evening.',
        type: 'Other',
        priority: 'Critical',
        status: 'Open',
        incidentDate: '2025-01-19T18:00:00Z',
        location: 'Last seen at Downtown Office Building',
        assignedOfficer: 'Detective Smith',
        createdById: 1
      }
    ];

    for (const caseData of sampleCases) {
      const id = this.currentCaseId++;
      const caseNumber = `CASE-${new Date().getFullYear()}-${id.toString().padStart(3, '0')}`;
      const newCase = {
        ...caseData,
        id,
        caseNumber,
        assignedOfficerId: null,
        createdAt: new Date('2025-01-20T11:00:00Z'),
        updatedAt: new Date('2025-01-21T09:15:00Z'),
      };
      this.cases.set(id, newCase);
    }
  }

  async createDefaultVehicles() {
    // Create sample police vehicles with designated patrol areas
    const sampleVehicles = [
      {
        vehicleId: 'PATROL-001',
        licensePlate: 'POL-001',
        vehicleType: 'patrol',
        make: 'Ford',
        model: 'Explorer',
        year: 2023,
        currentLocation: JSON.stringify([-122.4194, 37.7749]), // San Francisco coordinates
        assignedArea: JSON.stringify([
          [-122.4500, 37.7849],
          [-122.4000, 37.7849],
          [-122.4000, 37.7649],
          [-122.4500, 37.7649],
          [-122.4500, 37.7849]
        ]), // Downtown patrol area
        status: 'on_patrol',
        assignedOfficerId: 1
      },
      {
        vehicleId: 'PATROL-002',
        licensePlate: 'POL-002',
        vehicleType: 'motorcycle',
        make: 'Harley-Davidson',
        model: 'Police Special',
        year: 2022,
        currentLocation: JSON.stringify([-122.3894, 37.7594]),
        assignedArea: JSON.stringify([
          [-122.4200, 37.7700],
          [-122.3700, 37.7700],
          [-122.3700, 37.7500],
          [-122.4200, 37.7500],
          [-122.4200, 37.7700]
        ]), // South district patrol area
        status: 'available',
        assignedOfficerId: null
      },
      {
        vehicleId: 'K9-001',
        licensePlate: 'POL-K9-001',
        vehicleType: 'k9',
        make: 'Chevrolet',
        model: 'Tahoe',
        year: 2023,
        currentLocation: JSON.stringify([-122.4094, 37.7849]),
        assignedArea: JSON.stringify([
          [-122.4300, 37.7900],
          [-122.3900, 37.7900],
          [-122.3900, 37.7700],
          [-122.4300, 37.7700],
          [-122.4300, 37.7900]
        ]), // North district patrol area
        status: 'responding',
        assignedOfficerId: 1
      },
      {
        vehicleId: 'SPECIAL-001',
        licensePlate: 'POL-SWAT-001',
        vehicleType: 'special',
        make: 'Ford',
        model: 'F-550',
        year: 2021,
        currentLocation: JSON.stringify([-122.4394, 37.7949]),
        assignedArea: JSON.stringify([
          [-122.4600, 37.8000],
          [-122.4100, 37.8000],
          [-122.4100, 37.7800],
          [-122.4600, 37.7800],
          [-122.4600, 37.8000]
        ]), // Special operations area
        status: 'out_of_service',
        assignedOfficerId: null
      }
    ];

    for (const vehicleData of sampleVehicles) {
      const id = this.currentVehicleId++;
      const newVehicle = {
        ...vehicleData,
        id,
        lastUpdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.policeVehicles.set(id, newVehicle);
    }
  }

  async createDefaultGeofiles() {
    // Create sample geofiles with comprehensive metadata
    const sampleGeofiles = [
      {
        filename: 'patrol_routes_downtown.kml',
        filepath: '/geofiles/patrol_routes_downtown.kml',
        fileUrl: 'https://example.com/geofiles/patrol_routes_downtown.kml',
        fileType: 'kml',
        fileSize: 15400,
        coordinates: JSON.stringify([-122.4194, 37.7749]),
        boundingBox: JSON.stringify([[-122.45, 37.77], [-122.40, 37.78]]),
        address: '100 Market Street, San Francisco, CA',
        locationName: 'Downtown Patrol Zone',
        description: 'Primary patrol routes for downtown district including high-traffic commercial areas and tourist zones.',
        metadata: JSON.stringify({
          creator: 'Officer Johnson',
          version: '2.1',
          lastUpdated: '2025-01-15',
          patrolShift: 'day',
          priority: 'high'
        }),
        tags: JSON.stringify(['patrol', 'downtown', 'routes', 'primary']),
        isPublic: false,
        accessLevel: 'department',
        patrolArea: JSON.stringify([
          [-122.4500, 37.7849],
          [-122.4000, 37.7849],
          [-122.4000, 37.7649],
          [-122.4500, 37.7649]
        ]),
        incidentMarkers: JSON.stringify([
          { type: 'theft', coordinates: [-122.4194, 37.7749], severity: 'medium' },
          { type: 'vandalism', coordinates: [-122.4150, 37.7760], severity: 'low' }
        ]),
        caseId: 1,
        uploadedBy: 1
      },
      {
        filename: 'crime_hotspots_analysis.geojson',
        filepath: '/geofiles/crime_hotspots_analysis.geojson',
        fileType: 'geojson',
        fileSize: 28600,
        coordinates: JSON.stringify([-122.4094, 37.7849]),
        boundingBox: JSON.stringify([[-122.43, 37.78], [-122.39, 37.79]]),
        address: '500 Mission Street, San Francisco, CA',
        locationName: 'Mission District Analysis Zone',
        description: 'Statistical analysis of crime hotspots in the Mission District based on 6-month incident data.',
        metadata: JSON.stringify({
          creator: 'Crime Analytics Team',
          period: '2024-07-01 to 2024-12-31',
          incidents: 347,
          methodology: 'kernel_density_estimation'
        }),
        tags: JSON.stringify(['analysis', 'crime', 'hotspots', 'statistics', 'mission']),
        isPublic: true,
        accessLevel: 'public',
        uploadedBy: 1
      },
      {
        filename: 'emergency_evacuation_routes.gpx',
        filepath: '/geofiles/emergency_evacuation_routes.gpx',
        fileType: 'gpx',
        fileSize: 12300,
        coordinates: JSON.stringify([-122.3894, 37.7594]),
        address: '1800 3rd Street, San Francisco, CA',
        locationName: 'Emergency Response Corridor',
        description: 'Optimized evacuation routes for emergency scenarios including natural disasters and public safety threats.',
        metadata: JSON.stringify({
          creator: 'Emergency Planning Unit',
          capacity: '50000_persons',
          estimated_time: '45_minutes',
          accessibility: 'ada_compliant'
        }),
        tags: JSON.stringify(['emergency', 'evacuation', 'routes', 'safety']),
        isPublic: false,
        accessLevel: 'internal',
        uploadedBy: 1
      },
      {
        filename: 'surveillance_coverage_map.shp',
        filepath: '/geofiles/surveillance_coverage_map.shp',
        fileType: 'shp',
        fileSize: 45200,
        coordinates: JSON.stringify([-122.4394, 37.7949]),
        boundingBox: JSON.stringify([[-122.46, 37.79], [-122.41, 37.80]]),
        address: 'Citywide Coverage',
        locationName: 'CCTV Network Coverage',
        description: 'Comprehensive map of surveillance camera coverage areas and blind spots throughout the district.',
        metadata: JSON.stringify({
          cameras: 156,
          coverage_percentage: 78.5,
          blind_spots: 12,
          resolution: 'high_definition'
        }),
        tags: JSON.stringify(['surveillance', 'cctv', 'coverage', 'security']),
        isPublic: false,
        accessLevel: 'internal',
        evidenceId: null,
        uploadedBy: 1
      },
      {
        filename: 'incident_locations_jan2025.kmz',
        filepath: '/geofiles/incident_locations_jan2025.kmz',
        fileType: 'kmz',
        fileSize: 67800,
        coordinates: JSON.stringify([-122.4194, 37.7749]),
        address: 'Multiple locations citywide',
        locationName: 'January 2025 Incidents',
        description: 'Comprehensive mapping of all reported incidents during January 2025 including theft, vandalism, and traffic violations.',
        metadata: JSON.stringify({
          incidents: 89,
          resolved: 67,
          pending: 22,
          month: 'january_2025'
        }),
        tags: JSON.stringify(['incidents', 'january', '2025', 'reports', 'mapping']),
        isPublic: false,
        accessLevel: 'department',
        obId: null,
        uploadedBy: 1
      }
    ];

    for (const geofileData of sampleGeofiles) {
      const id = this.currentGeofileId++;
      const newGeofile = {
        ...geofileData,
        id,
        lastAccessedAt: new Date('2025-01-20T10:00:00Z'),
        downloadCount: Math.floor(Math.random() * 25), // Random download count for realism
        createdAt: new Date('2025-01-15T10:00:00Z'),
        updatedAt: new Date('2025-01-18T15:30:00Z'),
      };
      this.geofiles.set(id, newGeofile);
    }
  }

  // User operations
  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = { 
      ...insertUser, 
      id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      profileImage: null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id) {
    this.users.delete(id);
  }

  async updateLastLogin(id) {
    const user = this.users.get(id);
    if (user) {
      user.lastLoginAt = new Date();
      this.users.set(id, user);
    }
  }

  async getAllUsers() {
    return Array.from(this.users.values());
  }

  // Password reset operations
  async createPasswordResetToken(userId, token) {
    this.resetTokens.set(token, { 
      userId, 
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    });
  }

  async getPasswordResetToken(token) {
    const tokenData = this.resetTokens.get(token);
    if (!tokenData || tokenData.expiresAt < new Date()) {
      this.resetTokens.delete(token);
      return undefined;
    }
    return tokenData;
  }

  async deletePasswordResetToken(token) {
    this.resetTokens.delete(token);
  }

  async updateUserPassword(id, password) {
    const user = this.users.get(id);
    if (user) {
      user.password = password;
      user.updatedAt = new Date();
      this.users.set(id, user);
    }
  }

  // Case operations
  async getCases() {
    return Array.from(this.cases.values());
  }

  async getCase(id) {
    return this.cases.get(id);
  }

  async createCase(caseData) {
    const id = this.currentCaseId++;
    const caseNumber = `CASE-${new Date().getFullYear()}-${id.toString().padStart(3, '0')}`;
    const newCase = {
      ...caseData,
      id,
      caseNumber,
      assignedOfficerId: caseData.assignedOfficerId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cases.set(id, newCase);
    return newCase;
  }

  async updateCase(id, updates) {
    const existingCase = this.cases.get(id);
    if (!existingCase) throw new Error('Case not found');
    
    const updatedCase = { ...existingCase, ...updates, updatedAt: new Date() };
    this.cases.set(id, updatedCase);
    return updatedCase;
  }

  async deleteCase(id) {
    this.cases.delete(id);
  }

  // OB Entry operations
  async getOBEntries() {
    return Array.from(this.obEntries.values());
  }

  async getOBEntry(id) {
    return this.obEntries.get(id);
  }

  async createOBEntry(obData) {
    const id = this.currentOBId++;
    const obNumber = `OB/${new Date().getFullYear()}/${id.toString().padStart(4, '0')}`;
    const newEntry = {
      ...obData,
      id,
      obNumber,
      dateTime: new Date(),
      status: 'recorded',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.obEntries.set(id, newEntry);
    return newEntry;
  }

  async updateOBEntry(id, updates) {
    const existingEntry = this.obEntries.get(id);
    if (!existingEntry) throw new Error('OB Entry not found');
    
    const updatedEntry = { ...existingEntry, ...updates, updatedAt: new Date() };
    this.obEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteOBEntry(id) {
    this.obEntries.delete(id);
  }

  // License Plate operations
  async getLicensePlates() {
    return Array.from(this.licensePlates.values());
  }

  async getLicensePlate(id) {
    return this.licensePlates.get(id);
  }

  async getLicensePlateByNumber(plateNumber) {
    return Array.from(this.licensePlates.values()).find(
      (plate) => plate.plateNumber === plateNumber
    );
  }

  async createLicensePlate(plateData) {
    const id = this.currentPlateId++;
    const newPlate = {
      ...plateData,
      id,
      ownerImage: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.licensePlates.set(id, newPlate);
    return newPlate;
  }

  async updateLicensePlate(id, updates) {
    const existingPlate = this.licensePlates.get(id);
    if (!existingPlate) throw new Error('License plate not found');
    
    const updatedPlate = { ...existingPlate, ...updates, updatedAt: new Date() };
    this.licensePlates.set(id, updatedPlate);
    return updatedPlate;
  }

  async deleteLicensePlate(id) {
    this.licensePlates.delete(id);
  }

  // Evidence methods
  async getEvidence() {
    return Array.from(this.evidence.values());
  }

  async getEvidenceItem(id) {
    return this.evidence.get(id);
  }

  async getEvidenceByNumber(evidenceNumber) {
    return Array.from(this.evidence.values()).find(
      (evidence) => evidence.evidenceNumber === evidenceNumber
    );
  }

  async createEvidence(evidenceData) {
    const id = this.currentEvidenceId++;
    const evidenceNumber = `EV-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`;
    const newEvidence = {
      ...evidenceData,
      id,
      evidenceNumber,
      collectedBy: 1, // Default to admin user
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.evidence.set(id, newEvidence);
    return newEvidence;
  }

  async updateEvidence(id, updates) {
    const existingEvidence = this.evidence.get(id);
    if (!existingEvidence) throw new Error('Evidence not found');
    
    const updatedEvidence = { ...existingEvidence, ...updates, updatedAt: new Date() };
    this.evidence.set(id, updatedEvidence);
    return updatedEvidence;
  }

  async deleteEvidence(id) {
    this.evidence.delete(id);
  }

  // Geofiles methods
  async getGeofiles(filters = {}) {
    let geofiles = Array.from(this.geofiles.values());
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      geofiles = geofiles.filter(geofile => 
        geofile.filename?.toLowerCase().includes(searchLower) ||
        geofile.description?.toLowerCase().includes(searchLower) ||
        geofile.address?.toLowerCase().includes(searchLower) ||
        geofile.locationName?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply file type filter
    if (filters.fileType) {
      geofiles = geofiles.filter(geofile => 
        geofile.fileType?.toLowerCase() === filters.fileType.toLowerCase()
      );
    }
    
    // Apply access level filter
    if (filters.accessLevel) {
      geofiles = geofiles.filter(geofile => 
        geofile.accessLevel === filters.accessLevel
      );
    }
    
    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      geofiles = geofiles.filter(geofile => {
        if (!geofile.tags) return false;
        const geofileTags = JSON.parse(geofile.tags || '[]');
        return filters.tags.some(tag => geofileTags.includes(tag));
      });
    }
    
    // Apply date range filter
    if (filters.dateFrom || filters.dateTo) {
      geofiles = geofiles.filter(geofile => {
        const createdAt = new Date(geofile.createdAt);
        if (filters.dateFrom && createdAt < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && createdAt > new Date(filters.dateTo)) return false;
        return true;
      });
    }
    
    return geofiles;
  }

  async getGeofile(id) {
    return this.geofiles.get(id);
  }

  async createGeofile(geofileData) {
    const id = this.currentGeofileId++;
    const newGeofile = {
      ...geofileData,
      id,
      uploadedBy: geofileData.uploadedBy || 1,
      lastAccessedAt: new Date(),
      downloadCount: 0,
      isPublic: geofileData.isPublic || false,
      accessLevel: geofileData.accessLevel || 'internal',
      tags: geofileData.tags || '[]',
      metadata: geofileData.metadata || '{}',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.geofiles.set(id, newGeofile);
    return newGeofile;
  }

  async updateGeofile(id, updates) {
    const existingGeofile = this.geofiles.get(id);
    if (!existingGeofile) throw new Error('Geofile not found');
    
    const updatedGeofile = { ...existingGeofile, ...updates, updatedAt: new Date() };
    this.geofiles.set(id, updatedGeofile);
    return updatedGeofile;
  }

  async deleteGeofile(id) {
    this.geofiles.delete(id);
  }

  async updateGeofileAccess(id) {
    const geofile = this.geofiles.get(id);
    if (geofile) {
      geofile.lastAccessedAt = new Date();
      this.geofiles.set(id, geofile);
    }
  }

  async incrementGeofileDownload(id) {
    const geofile = this.geofiles.get(id);
    if (geofile) {
      geofile.downloadCount = (geofile.downloadCount || 0) + 1;
      geofile.lastAccessedAt = new Date();
      this.geofiles.set(id, geofile);
    }
  }

  async searchGeofilesByLocation(lat, lng, radiusMeters = 1000) {
    const geofiles = Array.from(this.geofiles.values());
    return geofiles.filter(geofile => {
      if (!geofile.coordinates) return false;
      
      try {
        const coords = JSON.parse(geofile.coordinates);
        if (!Array.isArray(coords) || coords.length < 2) return false;
        
        // Simple distance calculation (approximate)
        const [fileLng, fileLat] = coords;
        const distance = this.calculateDistance(lat, lng, fileLat, fileLng);
        return distance <= radiusMeters;
      } catch {
        return false;
      }
    });
  }

  async linkGeofileToCase(geofileId, caseId) {
    const geofile = this.geofiles.get(geofileId);
    const caseItem = this.cases.get(caseId);
    
    if (!geofile) throw new Error('Geofile not found');
    if (!caseItem) throw new Error('Case not found');
    
    geofile.caseId = caseId;
    geofile.updatedAt = new Date();
    this.geofiles.set(geofileId, geofile);
  }

  async addGeofileTags(geofileId, newTags) {
    const geofile = this.geofiles.get(geofileId);
    if (!geofile) throw new Error('Geofile not found');
    
    const existingTags = JSON.parse(geofile.tags || '[]');
    const combinedTags = [...new Set([...existingTags, ...newTags])];
    
    geofile.tags = JSON.stringify(combinedTags);
    geofile.updatedAt = new Date();
    this.geofiles.set(geofileId, geofile);
  }

  // Helper method for distance calculation
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  // Reports methods
  async getReports() {
    return Array.from(this.reports.values());
  }

  async getReport(id) {
    return this.reports.get(id);
  }

  async getReportByNumber(reportNumber) {
    return Array.from(this.reports.values()).find(
      (report) => report.reportNumber === reportNumber
    );
  }

  async createReport(reportData) {
    const id = this.currentReportId++;
    const reportNumber = `RPT-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`;
    const newReport = {
      ...reportData,
      id,
      reportNumber,
      requestedBy: 1, // Default to admin user
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reports.set(id, newReport);
    return newReport;
  }

  async updateReport(id, updates) {
    const existingReport = this.reports.get(id);
    if (!existingReport) throw new Error('Report not found');
    
    const updatedReport = { ...existingReport, ...updates, updatedAt: new Date() };
    this.reports.set(id, updatedReport);
    return updatedReport;
  }

  async deleteReport(id) {
    this.reports.delete(id);
  }

  // Police Vehicle methods
  async getPoliceVehicles() {
    return Array.from(this.policeVehicles.values());
  }

  async getPoliceVehicle(id) {
    return this.policeVehicles.get(id);
  }

  async getPoliceVehicleByLicensePlate(licensePlate) {
    return Array.from(this.policeVehicles.values()).find(
      (vehicle) => vehicle.licensePlate === licensePlate
    );
  }

  async createPoliceVehicle(vehicleData) {
    const id = this.currentVehicleId++;
    const newVehicle = {
      ...vehicleData,
      id,
      lastUpdate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.policeVehicles.set(id, newVehicle);
    return newVehicle;
  }

  async updatePoliceVehicle(id, updates) {
    const existingVehicle = this.policeVehicles.get(id);
    if (!existingVehicle) throw new Error('Police vehicle not found');
    
    const updatedVehicle = { 
      ...existingVehicle, 
      ...updates, 
      lastUpdate: new Date(),
      updatedAt: new Date() 
    };
    this.policeVehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deletePoliceVehicle(id) {
    this.policeVehicles.delete(id);
  }

  async updateVehicleLocation(id, location) {
    const vehicle = this.policeVehicles.get(id);
    if (!vehicle) throw new Error('Police vehicle not found');
    
    const updatedVehicle = {
      ...vehicle,
      currentLocation: JSON.stringify(location),
      lastUpdate: new Date(),
      updatedAt: new Date()
    };
    this.policeVehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async updateVehicleStatus(id, status) {
    const vehicle = this.policeVehicles.get(id);
    if (!vehicle) throw new Error('Police vehicle not found');
    
    const updatedVehicle = {
      ...vehicle,
      status,
      lastUpdate: new Date(),
      updatedAt: new Date()
    };
    this.policeVehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }
}

export const storage = new MemStorage();