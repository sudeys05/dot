
import { getDatabase } from './mongodb-connection.js';
import bcrypt from 'bcryptjs';

export async function seedAdminUser() {
  try {
    console.log('⚠️ Default admin user creation has been disabled for security reasons');
    console.log('ℹ️ Please create admin users through the registration system');
    return;
  } catch (error) {
    console.error('❌ Error in seedAdminUser:', error);
  }
}
