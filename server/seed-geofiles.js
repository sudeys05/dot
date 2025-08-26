
import { GeofilesCRUD } from './mongodb-crud.js';
import { getDatabase } from './mongodb-connection.js';

export async function seedGeofiles() {
  try {
    console.log('🌱 Seeding sample geofiles...');
    
    // Check if geofiles already exist
    const existingGeofiles = await GeofilesCRUD.findAll();
    if (existingGeofiles.length > 0) {
      console.log('✅ Geofiles already exist, skipping seed');
      return;
    }

    const sampleGeofiles = [
      {
        filename: 'crime_hotspots_analysis.geojson',
        filepath: '/geofiles/crime_hotspots_analysis.geojson',
        fileType: 'GEOJSON',
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
        tags: ['analysis', 'crime', 'hotspots', 'statistics', 'mission'],
        coordinateSystem: 'WGS84',
        isPublic: true,
        accessLevel: 'public',
        uploadedBy: 1,
        downloadCount: 12
      },
      {
        filename: 'emergency_evacuation_routes.gpx',
        filepath: '/geofiles/emergency_evacuation_routes.gpx',
        fileType: 'GPX',
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
        tags: ['emergency', 'evacuation', 'routes', 'safety'],
        coordinateSystem: 'WGS84',
        isPublic: false,
        accessLevel: 'internal',
        uploadedBy: 1,
        downloadCount: 8
      },
      {
        filename: 'surveillance_coverage_map.shp',
        filepath: '/geofiles/surveillance_coverage_map.shp',
        fileType: 'SHP',
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
        tags: ['surveillance', 'cctv', 'coverage', 'security'],
        coordinateSystem: 'WGS84',
        isPublic: false,
        accessLevel: 'internal',
        evidenceId: null,
        uploadedBy: 1,
        downloadCount: 5
      },
      {
        filename: 'patrol_districts.kml',
        filepath: '/geofiles/patrol_districts.kml',
        fileType: 'KML',
        fileSize: 34700,
        coordinates: JSON.stringify([-122.4094, 37.7849]),
        boundingBox: JSON.stringify([[-122.45, 37.75], [-122.35, 37.82]]),
        address: 'San Francisco Police Districts',
        locationName: 'SFPD Patrol Areas',
        description: 'Official patrol district boundaries and zone assignments for police units.',
        metadata: JSON.stringify({
          districts: 10,
          total_area: '121.4_sq_km',
          last_updated: '2025-01-01',
          version: '2.1'
        }),
        tags: ['patrol', 'districts', 'boundaries', 'zones'],
        coordinateSystem: 'WGS84',
        isPublic: false,
        accessLevel: 'department',
        uploadedBy: 1,
        downloadCount: 23
      },
      {
        filename: 'incident_locations_jan2025.csv',
        filepath: '/geofiles/incident_locations_jan2025.csv',
        fileType: 'CSV',
        fileSize: 67800,
        coordinates: JSON.stringify([-122.4194, 37.7749]),
        address: 'Multiple locations citywide',
        locationName: 'January 2025 Incidents',
        description: 'Comprehensive incident report locations for January 2025 with geocoded coordinates.',
        metadata: JSON.stringify({
          incidents: 234,
          period: '2025-01-01 to 2025-01-31',
          types: ['theft', 'assault', 'vandalism', 'traffic'],
          geocoding_accuracy: '95.2%'
        }),
        tags: ['incidents', 'january', '2025', 'locations', 'data'],
        coordinateSystem: 'WGS84',
        isPublic: false,
        accessLevel: 'internal',
        uploadedBy: 1,
        downloadCount: 3
      }
    ];

    for (const geofileData of sampleGeofiles) {
      const createdGeofile = await GeofilesCRUD.create(geofileData);
      console.log(`✅ Created geofile: ${createdGeofile.filename}`);
    }

    console.log(`🌱 Successfully seeded ${sampleGeofiles.length} geofiles`);
  } catch (error) {
    console.error('❌ Failed to seed geofiles:', error);
  }
}

