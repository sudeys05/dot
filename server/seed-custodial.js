
import { connectToMongoDB } from './mongodb-connection.js';
import { CustodialCRUD } from './mongodb-crud.js';

async function seedCustodialRecords() {
  try {
    console.log('🌱 Starting custodial records seeding...');
    
    // Connect to MongoDB
    await connectToMongoDB();
    console.log('✅ Connected to MongoDB for seeding');

    // Seed custodial records
    const result = await CustodialCRUD.seedSampleData();
    
    if (result.length > 0) {
      console.log(`✅ Successfully seeded ${result.length} custodial records`);
    } else {
      console.log('ℹ️ Custodial records already exist, skipped seeding');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding custodial records:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedCustodialRecords();
}

export { seedCustodialRecords };
