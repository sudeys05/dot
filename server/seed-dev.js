import mongoose from 'mongoose';
import { User } from './mongodb-models.js';
import { seedReports } from './seed-reports.js';
import { seedCustodialRecords } from './seed-custodial.js';

export async function seedDevAdmin() {
  console.log('⚠️ Default admin user creation has been disabled for security reasons');
  console.log('ℹ️ Please create admin users through the registration system');

  try {
    // Seed evidence data
    await seedEvidence();

    // Seed geofiles data
    await seedGeofiles();

    // Seed reports data
    await seedReports();

    // Seed custodial records
    await seedCustodialRecords();

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    // Don't throw error to prevent app startup failure
  }
}