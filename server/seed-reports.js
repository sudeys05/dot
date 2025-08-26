
import { ReportsCRUD } from './mongodb-crud.js';

export async function seedReports() {
  console.log('🌱 Seeding Reports Data...');
  
  try {
    // Check if reports already exist
    const existingReports = await ReportsCRUD.findAll();
    if (existingReports.length > 0) {
      console.log('📊 Reports data already exists, skipping seed');
      return;
    }

    // Sample reports data
    const reportsData = [
      {
        type: 'Warranty',
        title: 'Vehicle Equipment Warranty Claim',
        content: 'Police vehicle PV-001 radio equipment malfunction. Equipment purchased on 2024-08-15, still under warranty. Request manufacturer assessment and replacement.',
        status: 'Pending',
        priority: 'Medium',
        caseId: null,
        obId: null,
        evidenceId: null,
        requestedBy: 1
      },
      {
        type: 'Incident',
        title: 'Monthly Crime Statistics Report',
        content: 'Comprehensive analysis of crime statistics for the month of July 2025. Includes incident types, resolution rates, and geographical distribution of reported crimes.',
        status: 'Completed',
        priority: 'Low',
        caseId: null,
        obId: null,
        evidenceId: null,
        requestedBy: 1
      },
      {
        type: 'Investigation',
        title: 'Theft Investigation Summary',
        content: 'Investigation report for multiple theft incidents in the downtown area. Evidence collected, witnesses interviewed, and suspects identified.',
        status: 'Under Review',
        priority: 'High',
        caseId: null,
        obId: null,
        evidenceId: null,
        requestedBy: 1
      },
      {
        type: 'Case Summary',
        title: 'Vehicle Accident Case Report',
        content: 'Complete case summary for vehicle accident on Main Street. Includes police response, evidence collection, witness statements, and recommendations.',
        status: 'Approved',
        priority: 'Medium',
        caseId: null,
        obId: null,
        evidenceId: null,
        requestedBy: 1
      },
      {
        type: 'Evidence',
        title: 'Digital Evidence Analysis Report',
        content: 'Analysis of digital evidence collected from seized devices. Includes data recovery results, forensic findings, and chain of custody documentation.',
        status: 'Pending',
        priority: 'Urgent',
        caseId: null,
        obId: null,
        evidenceId: null,
        requestedBy: 1
      }
    ];

    // Insert reports into MongoDB
    console.log('📝 Inserting', reportsData.length, 'reports...');
    
    for (const reportData of reportsData) {
      try {
        await ReportsCRUD.create(reportData);
        console.log('✅ Created report:', reportData.title);
      } catch (error) {
        console.error('❌ Failed to create report:', reportData.title, error);
      }
    }

    console.log('✅ Reports seeding completed successfully');
  } catch (error) {
    console.error('❌ Error seeding reports:', error);
  }
}
