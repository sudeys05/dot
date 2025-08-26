import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Plus, 
  Search, 
  Edit2, 
  Eye, 
  RotateCcw,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Download,
  Printer,
  BarChart3
} from 'lucide-react';
import './Reports.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [obEntries, setObEntries] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [inmates, setInmates] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'detail'
  const [selectedReport, setSelectedReport] = useState(null);

  const reportTypes = [
    'Incident Report',
    'Custodial Report', 
    'Evidence Report',
    'Officer Activity Report',
    'Vehicle Report',
    'Monthly Summary',
    'Investigation Report',
    'Compliance Report'
  ];

  const reportStatuses = ['Draft', 'Generated', 'Reviewed', 'Approved', 'Archived'];

  useEffect(() => {
    fetchReports();
    fetchRelatedData();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Fetching reports from MongoDB API...');
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Received reports from API:', data);
        setReports(data.reports || []);
        setError('');
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch reports:', response.status, errorText);
        setError(`Failed to fetch reports: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Network error fetching reports:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      const [obRes, evidenceRes, inmatesRes, officersRes, vehiclesRes] = await Promise.all([
        fetch('/api/ob-entries'),
        fetch('/api/evidence'),
        fetch('/api/custodial-records'),
        fetch('/api/officers'),
        fetch('/api/police-vehicles')
      ]);

      const [obData, evidenceData, inmatesData, officersData, vehiclesData] = await Promise.all([
        obRes.ok ? obRes.json() : { obEntries: [] },
        evidenceRes.ok ? evidenceRes.json() : { evidence: [] },
        inmatesRes.ok ? inmatesRes.json() : { inmates: [] },
        officersRes.ok ? officersRes.json() : { officers: [] },
        vehiclesRes.ok ? vehiclesRes.json() : { vehicles: [] }
      ]);

      setObEntries(obData.obEntries || []);
      setEvidence(evidenceData.evidence || []);
      setInmates(inmatesData.inmates || []);
      setOfficers(officersData.officers || []);
      setVehicles(vehiclesData.vehicles || []);
    } catch (error) {
      console.error('Failed to fetch related data:', error);
    }
  };

  const filteredReports = reports.filter(report => {
    const searchContent = report.metadata?.title || report.reportNumber || '';
    const matchesSearch = searchContent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || report.metadata?.type === typeFilter;
    const matchesStatus = !statusFilter || report.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const navigateToView = (view, report = null) => {
    setCurrentView(view);
    setSelectedReport(report);
  };

  const goBack = () => {
    setCurrentView('list');
    setSelectedReport(null);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft': return <Clock size={16} className="status-draft" />;
      case 'generated': return <CheckCircle size={16} className="status-generated" />;
      case 'reviewed': return <Eye size={16} className="status-reviewed" />;
      case 'approved': return <CheckCircle size={16} className="status-approved" />;
      case 'archived': return <XCircle size={16} className="status-archived" />;
      default: return <Clock size={16} />;
    }
  };

  const ReportsList = () => (
    <div className="reports-list">
      <div className="reports-header">
        <div className="header-content">
          <BarChart3 className="header-icon" />
          <div>
            <h1>Generate Reports</h1>
            <p>Create comprehensive reports from your police management data</p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-btn" 
            onClick={fetchReports}
            disabled={isLoading}
            title="Refresh reports list"
          >
            <RotateCcw size={18} className={isLoading ? 'spinning' : ''} />
            Refresh
          </button>
          <button className="add-report-btn" onClick={() => navigateToView('create')}>
            <Plus size={18} />
            Generate New Report
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {reportTypes.map(type => (
              <option key={type} value={type.toLowerCase().replace(/ /g, '_')}>{type}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            {reportStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="reports-grid">
        {isLoading ? (
          <div className="loading-state">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="empty-state">
            <BarChart3 size={48} />
            <h3>No reports found</h3>
            <p>Generate your first report or adjust your search filters</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report._id} className="report-card" onClick={() => navigateToView('detail', report)}>
              <div className="report-header">
                <div className="report-info">
                  <h3>{report.reportNumber}</h3>
                  <p className="report-title">{report.metadata?.title || 'Untitled Report'}</p>
                </div>
                <div className="report-type">
                  <FileText size={16} />
                  <span>{report.metadata?.type?.replace(/_/g, ' ') || 'Report'}</span>
                </div>
              </div>
              <div className="report-body">
                <div className="status-info">
                  {getStatusIcon(report.status || 'Generated')}
                  <span className="status-text">{report.status || 'Generated'}</span>
                </div>
                <div className="report-details">
                  <p className="content-preview">
                    {Array.isArray(report.content) && report.content.length > 0 
                      ? report.content[0].content?.substring(0, 100) + '...'
                      : (report.content?.substring(0, 100) + '...' || 'No content available')
                    }
                  </p>
                  <p className="created-date">
                    <Calendar size={14} />
                    Generated: {new Date(report.metadata?.generatedAt || report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const CreateReportForm = () => {
    const [formData, setFormData] = useState({
      title: '',
      type: 'incident_report',
      description: '',
      modules: ['ob'],
      dateRange: 'week',
      moduleOptions: {
        ob: {
          includeTypes: true,
          includePending: true,
          includeCompleted: true,
          includeClassifications: true,
          includeWitnesses: true,
          includeEvidence: true
        },
        custodial: {
          includePersonalInfo: true,
          includeMedical: true,
          includeCharges: true,
          includeClassification: true,
          includeRiskLevel: true,
          includeBehavior: true
        },
        evidence: {
          includePhysical: true,
          includeDigital: true,
          includeDocuments: true,
          includeChainOfCustody: true,
          includeLocation: true,
          includeCondition: true
        },
        officers: {
          includePersonalInfo: true,
          includeDepartments: true,
          includeRanks: true,
          includeSpecializations: true,
          includeStatus: true,
          includeExperience: true
        },
        vehicles: {
          includeTypes: true,
          includeStatus: true,
          includeMaintenance: true,
          includeAssignments: true
        }
      },
      criteria: {
        status: '',
        incidentType: '',
        inmateStatus: '',
        riskLevel: '',
        evidenceType: '',
        department: '',
        startDate: '',
        endDate: ''
      }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const moduleOptions = [
      { 
        id: 'ob', 
        label: 'Occurrence Book Entries', 
        count: obEntries.length,
        options: [
          { key: 'includeTypes', label: 'Incident Types & Classifications', description: 'Include incident types, case classifications, and subtypes' },
          { key: 'includePending', label: 'Pending Cases', description: 'Include cases with pending status' },
          { key: 'includeCompleted', label: 'Completed Cases', description: 'Include resolved and completed cases' },
          { key: 'includeClassifications', label: 'Case Classifications', description: 'Include criminal, civil, and administrative classifications' },
          { key: 'includeWitnesses', label: 'Witness Information', description: 'Include witness details and statements' },
          { key: 'includeEvidence', label: 'Evidence References', description: 'Include linked evidence and references' }
        ]
      },
      { 
        id: 'custodial', 
        label: 'Custodial Records', 
        count: inmates.length,
        options: [
          { key: 'includePersonalInfo', label: 'Personal Information', description: 'Include names, ages, demographics, and contact details' },
          { key: 'includeMedical', label: 'Medical Records', description: 'Include medical conditions, allergies, and doctor notes' },
          { key: 'includeCharges', label: 'Charges & Legal Info', description: 'Include charges, sentences, and court references' },
          { key: 'includeClassification', label: 'Security Classification', description: 'Include security levels and facility classifications' },
          { key: 'includeRiskLevel', label: 'Risk Assessment', description: 'Include risk levels and safety classifications' },
          { key: 'includeBehavior', label: 'Behavioral Reports', description: 'Include behavior reports and disciplinary actions' }
        ]
      },
      { 
        id: 'evidence', 
        label: 'Evidence Management', 
        count: evidence.length,
        options: [
          { key: 'includePhysical', label: 'Physical Evidence', description: 'Include physical items, weapons, and tangible evidence' },
          { key: 'includeDigital', label: 'Digital Evidence', description: 'Include digital files, photos, videos, and electronic data' },
          { key: 'includeDocuments', label: 'Documents', description: 'Include documents, reports, and written evidence' },
          { key: 'includeChainOfCustody', label: 'Chain of Custody', description: 'Include custody logs and transfer records' },
          { key: 'includeLocation', label: 'Storage & Location', description: 'Include storage locations and evidence room data' },
          { key: 'includeCondition', label: 'Condition & Status', description: 'Include evidence condition and current status' }
        ]
      },
      { 
        id: 'officers', 
        label: 'Officer Records', 
        count: officers.length,
        options: [
          { key: 'includePersonalInfo', label: 'Personal Information', description: 'Include names, badge numbers, and contact information' },
          { key: 'includeDepartments', label: 'Department Assignment', description: 'Include department assignments and transfers' },
          { key: 'includeRanks', label: 'Ranks & Positions', description: 'Include current ranks, positions, and promotions' },
          { key: 'includeSpecializations', label: 'Specializations', description: 'Include training, certifications, and specializations' },
          { key: 'includeStatus', label: 'Employment Status', description: 'Include active, inactive, and disciplinary status' },
          { key: 'includeExperience', label: 'Experience & Service', description: 'Include years of service and experience records' }
        ]
      },
      { 
        id: 'vehicles', 
        label: 'Vehicle Registry', 
        count: vehicles.length,
        options: [
          { key: 'includeTypes', label: 'Vehicle Types', description: 'Include vehicle types, models, and specifications' },
          { key: 'includeStatus', label: 'Operational Status', description: 'Include active, maintenance, and retired status' },
          { key: 'includeMaintenance', label: 'Maintenance Records', description: 'Include service history and maintenance logs' },
          { key: 'includeAssignments', label: 'Officer Assignments', description: 'Include current and historical officer assignments' }
        ]
      }
    ];

    const dateRangeOptions = [
      { value: 'today', label: 'Today' },
      { value: 'week', label: 'This Week' },
      { value: 'month', label: 'This Month' },
      { value: 'quarter', label: 'This Quarter' },
      { value: 'year', label: 'This Year' },
      { value: 'custom', label: 'Custom Range' }
    ];

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      if (name.startsWith('criteria.')) {
        const criteriaKey = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          criteria: { ...prev.criteria, [criteriaKey]: value }
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    };

    const handleModuleChange = (moduleId) => {
      setFormData(prev => ({
        ...prev,
        modules: prev.modules.includes(moduleId)
          ? prev.modules.filter(m => m !== moduleId)
          : [...prev.modules, moduleId]
      }));
    };

    const handleModuleOptionChange = (moduleId, optionKey) => {
      setFormData(prev => ({
        ...prev,
        moduleOptions: {
          ...prev.moduleOptions,
          [moduleId]: {
            ...prev.moduleOptions[moduleId],
            [optionKey]: !prev.moduleOptions[moduleId]?.[optionKey]
          }
        }
      }));
    };

    const validateForm = () => {
      const newErrors = {};
      if (!formData.title.trim()) newErrors.title = 'Report title is required';
      if (formData.modules.length === 0) newErrors.modules = 'Select at least one data module';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const generateReportContent = () => {
      const content = [];

      // Executive Summary
      content.push({
        title: 'Executive Summary',
        content: `
        This ${formData.type.replace(/_/g, ' ')} report covers the period from ${formData.dateRange} and includes comprehensive data from multiple police management modules.

        Key Highlights:
        • Total Incidents Recorded: ${obEntries.length}
        • Active Inmates: ${inmates.filter(i => i.status === 'Active').length}
        • Vehicles Registered: ${vehicles.length}
        • Evidence Items: ${evidence.length}
        • Officers Involved: ${officers.length}

        This report provides integrated analysis across occurrence book entries, custodial records, vehicle registrations, and evidence management to support operational decision-making.
        `,
        table: null
      });

      // Module-specific content
      if (formData.modules.includes('ob')) {
        const obOptions = formData.moduleOptions.ob;
        let obContent = `Total Incidents: ${obEntries.length}\n\n`;

        if (obOptions.includeTypes) {
          const incidentTypes = [...new Set(obEntries.map(ob => ob.incidentType || ob.type).filter(Boolean))];
          obContent += `Incident Types:\n${incidentTypes.map(type => `• ${type}: ${obEntries.filter(ob => (ob.incidentType || ob.type) === type).length} cases`).join('\n')}\n\n`;
        }

        if (obOptions.includeClassifications) {
          const classifications = [...new Set(obEntries.map(ob => ob.caseClassification).filter(Boolean))];
          obContent += `Case Classifications:\n${classifications.map(cls => `• ${cls}: ${obEntries.filter(ob => ob.caseClassification === cls).length} cases`).join('\n')}\n\n`;
        }

        if (obOptions.includePending) {
          const pendingCases = obEntries.filter(ob => ob.status === 'Pending');
          obContent += `Pending Cases: ${pendingCases.length}\n`;
        }

        if (obOptions.includeCompleted) {
          const completedCases = obEntries.filter(ob => ob.status === 'Completed' || ob.status === 'Closed');
          obContent += `Completed Cases: ${completedCases.length}\n`;
        }

        // Create detailed OB entries table
        const obTableData = obEntries.map(ob => ({
          'OB Number': ob.obNumber || 'N/A',
          'Date/Time': new Date(ob.dateTime || ob.createdAt).toLocaleString(),
          'Location': ob.location || 'N/A',
          'Incident Type': ob.incidentType || ob.type || 'N/A',
          'Classification': ob.caseClassification || 'N/A',
          'Complainant': ob.complainantName || ob.reportedBy || 'N/A',
          'Officer': ob.recordingOfficer || ob.officer || 'N/A',
          'Status': ob.status || 'Pending',
          'Priority': ob.priority || 'Medium',
          'Witnesses': ob.witnessesPresent ? 'Yes' : 'No',
          'Evidence': ob.evidenceCollected ? 'Yes' : 'No',
          'Description': (ob.incidentDescription || ob.description || '').substring(0, 50) + '...'
        }));

        content.push({
          title: 'Occurrence Book Analysis',
          content: obContent,
          table: {
            headers: ['OB Number', 'Date/Time', 'Location', 'Incident Type', 'Classification', 'Complainant', 'Officer', 'Status', 'Priority', 'Witnesses', 'Evidence', 'Description'],
            rows: obTableData
          }
        });
      }

      if (formData.modules.includes('custodial')) {
        const custodialOptions = formData.moduleOptions.custodial;
        let custodialContent = `Total Inmates: ${inmates.length}\nActive Inmates: ${inmates.filter(i => i.status === 'Active').length}\n\n`;

        if (custodialOptions.includePersonalInfo) {
          const genderStats = [...new Set(inmates.map(i => i.gender).filter(Boolean))];
          custodialContent += `Demographics:\n${genderStats.map(gender => `• ${gender}: ${inmates.filter(i => i.gender === gender).length} inmates`).join('\n')}\n\n`;
        }

        if (custodialOptions.includeRiskLevel) {
          const riskLevels = [...new Set(inmates.map(i => i.riskLevel).filter(Boolean))];
          custodialContent += `Risk Level Distribution:\n${riskLevels.map(level => `• ${level}: ${inmates.filter(i => i.riskLevel === level).length} inmates`).join('\n')}\n\n`;
        }

        if (custodialOptions.includeClassification) {
          const classifications = [...new Set(inmates.map(i => i.classification).filter(Boolean))];
          custodialContent += `Security Classifications:\n${classifications.map(cls => `• ${cls}: ${inmates.filter(i => i.classification === cls).length} inmates`).join('\n')}\n\n`;
        }

        // Create detailed custodial records table
        const custodialTableData = inmates.map(inmate => ({
          'Prisoner Number': inmate.prisonerNumber || 'N/A',
          'Full Name': inmate.fullName || 'N/A',
          'Age': inmate.age || 'N/A',
          'Gender': inmate.gender || 'N/A',
          'Admission Date': inmate.admissionDate ? new Date(inmate.admissionDate).toLocaleDateString() : 'N/A',
          'Status': inmate.status || 'N/A',
          'Classification': inmate.classification || 'N/A',
          'Risk Level': inmate.riskLevel || 'N/A',
          'Charges': Array.isArray(inmate.charges) ? inmate.charges.join(', ').substring(0, 50) + '...' : 'N/A',
          'Medical Conditions': inmate.medicalConditions ? (inmate.medicalConditions.substring(0, 30) + '...') : 'None',
          'Emergency Contact': inmate.emergencyContactName || 'N/A',
          'Contact Phone': inmate.contactPhone || 'N/A'
        }));

        content.push({
          title: 'Custodial Records Summary',
          content: custodialContent,
          table: {
            headers: ['Prisoner Number', 'Full Name', 'Age', 'Gender', 'Admission Date', 'Status', 'Classification', 'Risk Level', 'Charges', 'Medical Conditions', 'Emergency Contact', 'Contact Phone'],
            rows: custodialTableData
          }
        });
      }

      if (formData.modules.includes('evidence')) {
        const evidenceOptions = formData.moduleOptions.evidence;
        let evidenceContent = `Total Evidence Items: ${evidence.length}\n\n`;

        if (evidenceOptions.includePhysical || evidenceOptions.includeDigital || evidenceOptions.includeDocuments) {
          const typeFilter = [];
          if (evidenceOptions.includePhysical) typeFilter.push('Physical');
          if (evidenceOptions.includeDigital) typeFilter.push('Digital', 'Photo', 'Video', 'Audio');
          if (evidenceOptions.includeDocuments) typeFilter.push('Document');
          
          const filteredEvidence = evidence.filter(e => typeFilter.includes(e.type));
          evidenceContent += `Filtered Evidence Types:\n${[...new Set(filteredEvidence.map(e => e.type))].map(type => `• ${type}: ${filteredEvidence.filter(e => e.type === type).length} items`).join('\n')}\n\n`;
        }

        if (evidenceOptions.includeLocation) {
          const locations = [...new Set(evidence.map(e => e.storageLocation).filter(Boolean))];
          evidenceContent += `Storage Locations:\n${locations.map(loc => `• ${loc}: ${evidence.filter(e => e.storageLocation === loc).length} items`).join('\n')}\n\n`;
        }

        // Create detailed evidence table
        const evidenceTableData = evidence.map(item => ({
          'Evidence Number': item.evidenceNumber || 'N/A',
          'Type': item.type || 'N/A',
          'Category': item.category || 'N/A',
          'Description': (item.description || '').substring(0, 50) + '...',
          'Collection Date': item.collectionDate ? new Date(item.collectionDate).toLocaleDateString() : 'N/A',
          'Location Found': item.locationFound || 'N/A',
          'Collected By': item.collectedBy || 'N/A',
          'Storage Location': item.storageLocation || 'N/A',
          'Condition': item.condition || 'N/A',
          'Status': item.status || 'N/A',
          'Chain of Custody': item.custodyLog && item.custodyLog.length > 0 ? `${item.custodyLog.length} entries` : 'None',
          'OB Reference': item.obId || item.caseReference || 'N/A'
        }));

        content.push({
          title: 'Evidence Management Report',
          content: evidenceContent,
          table: {
            headers: ['Evidence Number', 'Type', 'Category', 'Description', 'Collection Date', 'Location Found', 'Collected By', 'Storage Location', 'Condition', 'Status', 'Chain of Custody', 'OB Reference'],
            rows: evidenceTableData
          }
        });
      }

      if (formData.modules.includes('officers')) {
        const officerOptions = formData.moduleOptions.officers;
        let officerContent = `Total Officers: ${officers.length}\n`;

        if (officerOptions.includeStatus) {
          const activeOfficers = officers.filter(o => o.status === 'active' || o.status === 'Active');
          officerContent += `Active Officers: ${activeOfficers.length}\n\n`;
        }

        if (officerOptions.includeDepartments) {
          const departments = [...new Set(officers.map(o => o.department).filter(Boolean))];
          officerContent += `Departments:\n${departments.map(dept => `• ${dept}: ${officers.filter(o => o.department === dept).length} officers`).join('\n')}\n\n`;
        }

        if (officerOptions.includeRanks) {
          const positions = [...new Set(officers.map(o => o.position).filter(Boolean))];
          officerContent += `Positions/Ranks:\n${positions.map(pos => `• ${pos}: ${officers.filter(o => o.position === pos).length} officers`).join('\n')}\n\n`;
        }

        // Create detailed officers table
        const officersTableData = officers.map(officer => ({
          'Badge Number': officer.badgeNumber || 'N/A',
          'Name': `${officer.firstName || ''} ${officer.lastName || ''}`.trim() || 'N/A',
          'Department': officer.department || 'N/A',
          'Position': officer.position || 'N/A',
          'Status': officer.status || 'N/A',
          'Phone': officer.phone || 'N/A',
          'Email': officer.email || 'N/A',
          'Specialization': officer.specialization || 'N/A',
          'Years of Service': officer.yearsOfService || 'N/A',
          'Emergency Contact': officer.emergencyContact || 'N/A',
          'Address': officer.address || 'N/A',
          'Join Date': officer.createdAt ? new Date(officer.createdAt).toLocaleDateString() : 'N/A'
        }));

        content.push({
          title: 'Officer Activity Summary',
          content: officerContent,
          table: {
            headers: ['Badge Number', 'Name', 'Department', 'Position', 'Status', 'Phone', 'Email', 'Specialization', 'Years of Service', 'Emergency Contact', 'Address', 'Join Date'],
            rows: officersTableData
          }
        });
      }

      if (formData.modules.includes('vehicles')) {
        let vehicleContent = `Total Vehicles: ${vehicles.length}\n\n`;
        
        vehicleContent += `Vehicle Status:\n${[...new Set(vehicles.map(v => v.status).filter(Boolean))].map(status => 
          `• ${status}: ${vehicles.filter(v => v.status === status).length} vehicles`
        ).join('\n')}\n\n`;

        vehicleContent += `Vehicle Types:\n${[...new Set(vehicles.map(v => v.type).filter(Boolean))].map(type => 
          `• ${type}: ${vehicles.filter(v => v.type === type).length} vehicles`
        ).join('\n')}\n`;

        // Create detailed vehicles table
        const vehiclesTableData = vehicles.map(vehicle => ({
          'Vehicle ID': vehicle.vehicleId || vehicle._id || 'N/A',
          'Type': vehicle.type || 'N/A',
          'Make/Model': `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 'N/A',
          'License Plate': vehicle.licensePlate || vehicle.plateNumber || 'N/A',
          'Status': vehicle.status || 'N/A',
          'Assigned Officer': vehicle.assignedOfficer || 'Unassigned',
          'Mileage': vehicle.mileage || 'N/A',
          'Last Service': vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString() : 'N/A',
          'Registration Date': vehicle.registrationDate ? new Date(vehicle.registrationDate).toLocaleDateString() : 'N/A',
          'Insurance Status': vehicle.insuranceStatus || 'N/A',
          'Fuel Type': vehicle.fuelType || 'N/A',
          'Color': vehicle.color || 'N/A'
        }));

        content.push({
          title: 'Vehicle Registry Report',
          content: vehicleContent,
          table: {
            headers: ['Vehicle ID', 'Type', 'Make/Model', 'License Plate', 'Status', 'Assigned Officer', 'Mileage', 'Last Service', 'Registration Date', 'Insurance Status', 'Fuel Type', 'Color'],
            rows: vehiclesTableData
          }
        });
      }

      return content;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        const reportData = {
          metadata: {
            title: formData.title,
            type: formData.type,
            description: formData.description,
            modules: formData.modules,
            dateRange: formData.dateRange,
            criteria: formData.criteria,
            generatedBy: 'System User',
            generatedAt: new Date().toISOString()
          },
          content: generateReportContent(),
          status: 'Generated',
          generatedAt: new Date().toISOString()
        };

        console.log('🔍 Generating report with data:', reportData);
        const response = await fetch('/api/custodial-reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Report generated successfully:', result);
          await fetchReports();
          goBack();
        } else {
          const errorData = await response.json();
          console.error('❌ Failed to generate report:', errorData);
          setErrors({ submit: errorData.message || 'Failed to generate report' });
        }
      } catch (error) {
        console.error('❌ Network error during report generation:', error);
        setErrors({ submit: 'Network error. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="report-form-container">
        <div className="form-header">
          <button className="back-btn" onClick={goBack}>
            <BarChart3 size={20} />
            Back to Reports
          </button>
          <h1>Generate New Report</h1>
        </div>

        <form onSubmit={handleSubmit} className="report-generation-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">Report Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter report title"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="type">Report Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                {reportTypes.map(type => (
                  <option key={type} value={type.toLowerCase().replace(/ /g, '_')}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dateRange">Date Range *</label>
              <select
                id="dateRange"
                name="dateRange"
                value={formData.dateRange}
                onChange={handleInputChange}
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Report Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Optional description for this report..."
              rows="3"
            />
          </div>

          <div className="form-group full-width">
            <label>Data Modules to Include *</label>
            <div className="modules-selection">
              {moduleOptions.map(module => (
                <div key={module.id} className="module-section">
                  <div className="module-header">
                    <label className="module-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.modules.includes(module.id)}
                        onChange={() => handleModuleChange(module.id)}
                      />
                      <div className="module-info">
                        <span className="module-label">{module.label}</span>
                        <span className="module-count">{module.count} records</span>
                      </div>
                    </label>
                  </div>
                  
                  {formData.modules.includes(module.id) && (
                    <div className="module-options">
                      <h5>Select data to include:</h5>
                      <div className="option-grid">
                        {module.options.map(option => (
                          <div key={option.key} className="option-item">
                            <label className="option-checkbox">
                              <input
                                type="checkbox"
                                checked={formData.moduleOptions[module.id]?.[option.key] || false}
                                onChange={() => handleModuleOptionChange(module.id, option.key)}
                              />
                              <div className="option-details">
                                <span className="option-label">{option.label}</span>
                                <span className="option-description">{option.description}</span>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {errors.modules && <span className="error-text">{errors.modules}</span>}
          </div>

          {formData.dateRange === 'custom' && (
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="criteria.startDate">Start Date</label>
                <input
                  type="date"
                  id="criteria.startDate"
                  name="criteria.startDate"
                  value={formData.criteria.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="criteria.endDate">End Date</label>
                <input
                  type="date"
                  id="criteria.endDate"
                  name="criteria.endDate"
                  value={formData.criteria.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="submit-error">
              {errors.submit}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={goBack}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const ReportDetail = () => {
    const reportContent = selectedReport?.content || [];

    return (
      <div className="report-detail">
        <div className="detail-header">
          <button className="back-btn" onClick={goBack}>
            <BarChart3 size={20} />
            Back to Reports
          </button>
          <div className="detail-actions">
            <button onClick={() => window.print()}>
              <Printer size={16} />
              Print Report
            </button>
            <button>
              <Download size={16} />
              Download PDF
            </button>
          </div>
        </div>

        <div className="report-info-panel">
          <div className="panel-header">
            <div className="report-display">
              <BarChart3 size={32} />
              <div>
                <h1>{selectedReport?.metadata?.title || selectedReport?.reportNumber}</h1>
                <p className="report-subtitle">{selectedReport?.metadata?.type?.replace(/_/g, ' ') || 'System Report'}</p>
              </div>
              <div className="status-badge">
                {getStatusIcon(selectedReport?.status)}
                {selectedReport?.status || 'Generated'}
              </div>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-section">
              <h3>Report Information</h3>
              <div className="info-grid">
                <div><strong>Report Number:</strong> {selectedReport?.reportNumber}</div>
                <div><strong>Type:</strong> {selectedReport?.metadata?.type?.replace(/_/g, ' ')}</div>
                <div><strong>Status:</strong> {selectedReport?.status || 'Generated'}</div>
                <div><strong>Date Range:</strong> {selectedReport?.metadata?.dateRange}</div>
                <div><strong>Generated:</strong> {new Date(selectedReport?.metadata?.generatedAt || selectedReport?.createdAt).toLocaleString()}</div>
                <div><strong>Generated By:</strong> {selectedReport?.metadata?.generatedBy}</div>
              </div>
            </div>

            <div className="report-content">
              {Array.isArray(selectedReport.content) ? (
                selectedReport.content.map((section, index) => (
                  <div key={index} className="report-section">
                    <h4>{section.title}</h4>
                    <pre className="section-content">{section.content}</pre>
                    {section.table && (
                      <div className="report-table">
                        <div className="table-wrapper">
                          <table>
                            <thead>
                              <tr>
                                {section.table.headers.map((header, idx) => (
                                  <th key={idx}>{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {section.table.rows.map((row, rowIdx) => (
                                <tr key={rowIdx}>
                                  {section.table.headers.map((header, colIdx) => (
                                    <td key={colIdx} title={row[header]}>
                                      {row[header]}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="table-summary">
                          Showing {section.table.rows.length} records
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <pre>{selectedReport.content || 'No content available'}</pre>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  switch (currentView) {
    case 'detail':
      return <ReportDetail />;
    case 'create':
      return <CreateReportForm />;
    default:
      return <ReportsList />;
  }
};

export default Reports;