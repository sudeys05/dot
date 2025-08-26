
import React, { useState, useEffect } from 'react';
import { Search, Plus, Clock, FileText, Edit, Trash2, AlertTriangle, ChevronDown, ChevronRight, Save, X, Filter, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import './OccurrenceBook.css';

// FormSection component outside main component to prevent re-renders
const FormSection = ({ title, children, sectionKey, collapsedSections, toggleSection }) => (
  <div className="form-section">
    <div 
      className="section-header" 
      onClick={() => toggleSection(sectionKey)}
    >
      {collapsedSections[sectionKey] ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
      <h4>{title}</h4>
    </div>
    {!collapsedSections[sectionKey] && (
      <div className="section-content">
        {children}
      </div>
    )}
  </div>
);

const OccurrenceBook = ({ onAddOBClick, obEntries, onUpdateOB, onDeleteOB }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [editingEntry, setEditingEntry] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [localOBEntries, setLocalOBEntries] = useState(obEntries || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);
  
  // Form state for new OB entry
  const [formData, setFormData] = useState({
    // Basic Details
    obNumber: '',
    dateTime: new Date().toISOString().slice(0, 16),
    location: '',
    
    // Case Classification
    caseClassification: '',
    caseSubtype: '',
    
    // Complainant Information
    complainantName: '',
    complainantAge: '',
    complainantGender: '',
    complainantAddress: '',
    complainantPhone: '',
    complainantEmail: '',
    complainantIdNumber: '',
    
    // Incident Description
    incidentType: '',
    incidentDescription: '',
    incidentSeverity: 'Medium',
    witnessesPresent: false,
    witnessDetails: '',
    evidenceCollected: false,
    evidenceDescription: '',
    
    // Action Taken
    immediateAction: '',
    actionTakenBy: '',
    actionTime: '',
    referredTo: '',
    followUpRequired: false,
    followUpDate: '',
    followUpNotes: '',
    
    // Officer Details
    recordingOfficer: '',
    recordingOfficerBadge: '',
    supervisingOfficer: '',
    supervisingOfficerBadge: '',
    
    // Reference Numbers
    caseReference: '',
    courtReference: '',
    evidenceReference: '',
    reportReference: '',
    
    // Status and Priority
    status: 'Pending',
    priority: 'Medium'
  });

  // Fetch OB entries from API
  const fetchOBEntries = async () => {
    try {
      console.log('🔍 Fetching OB entries from MongoDB...');
      const response = await fetch('/api/ob-entries');
      if (!response.ok) {
        throw new Error(`Failed to fetch OB entries: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('📊 Received OB entries from API:', data);
      setLocalOBEntries(data.obEntries || []);
      console.log('✅ OB entries set in state:', data.obEntries?.length || 0, 'entries');
    } catch (error) {
      console.error('❌ Failed to fetch OB entries:', error);
    }
  };

  // Use local state or props, prioritize local state
  React.useEffect(() => {
    if (obEntries && obEntries.length > 0) {
      setLocalOBEntries(obEntries);
    } else {
      fetchOBEntries();
    }
  }, [obEntries]);

  // Case classifications and their subtypes
  const caseClassifications = {
    'Criminal Cases': [
      'Theft', 'Assault', 'Homicide', 'Robbery', 'Burglary', 'Fraud', 
      'Drug Offenses', 'Vandalism', 'Kidnapping', 'Sexual Assault'
    ],
    'Civil Cases': [
      'Property Disputes', 'Contract Disputes', 'Family Law Matters', 
      'Neighbor Disputes', 'Debt Collection', 'Personal Injury'
    ],
    'Juvenile Cases': [
      'Minor Theft', 'Truancy', 'Underage Drinking', 'Curfew Violations',
      'School Incidents', 'Family Issues'
    ],
    'Traffic Cases': [
      'Traffic Accidents', 'Speed Violations', 'DUI/DWI', 'Reckless Driving',
      'Hit and Run', 'Vehicle Theft', 'Parking Violations'
    ],
    'Administrative Cases': [
      'Internal Complaints', 'Missing Items', 'Internal Reports', 
      'Equipment Issues', 'Policy Violations', 'Personnel Matters'
    ]
  };

  const stats = [
    { title: 'Total Entries', value: localOBEntries.length.toString(), icon: FileText, color: 'blue' },
    { title: 'Today\'s Entries', value: localOBEntries.filter(e => e.date === new Date().toISOString().split('T')[0]).length.toString(), icon: Clock, color: 'orange' },
    { title: 'Pending Review', value: localOBEntries.filter(e => e.status === 'Pending').length.toString(), icon: AlertTriangle, color: 'red' }
  ];

  // Enhanced filtering logic
  const filteredEntries = localOBEntries.filter(entry => {
    const matchesSearch = entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.obNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.reportedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.complainantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || entry.type?.toLowerCase() === typeFilter.toLowerCase();
    const matchesClassification = classificationFilter === 'all' || entry.caseClassification === classificationFilter;
    const matchesStatus = statusFilter === 'all' || entry.status?.toLowerCase() === statusFilter.toLowerCase();
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const entryDate = new Date(entry.date || entry.dateTime);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      switch (dateFilter) {
        case 'today':
          matchesDate = entryDate.toDateString() === today.toDateString();
          break;
        case 'yesterday':
          matchesDate = entryDate.toDateString() === yesterday.toDateString();
          break;
        case 'week':
          matchesDate = entryDate >= lastWeek;
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesType && matchesClassification && matchesStatus && matchesDate;
  });

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredEntries.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);

  const handleEdit = (entry) => {
    setEditingEntry(entry);
  };

  const handleDelete = async (obId) => {
    if (window.confirm('Are you sure you want to delete this OB entry? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/ob-entries/${obId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          await fetchOBEntries();
          alert('OB entry deleted successfully!');
        } else {
          throw new Error('Failed to delete OB entry');
        }
      } catch (error) {
        console.error('❌ Failed to delete OB entry:', error);
        alert('Failed to delete OB entry. Please try again.');
      }
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/ob-entries/${editingEntry.id || editingEntry._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingEntry)
      });
      
      if (response.ok) {
        await fetchOBEntries();
        setEditingEntry(null);
        alert('OB entry updated successfully!');
      } else {
        throw new Error('Failed to update OB entry');
      }
    } catch (error) {
      console.error('❌ Failed to update OB entry:', error);
      alert('Failed to update OB entry. Please try again.');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // Reset subtype when classification changes
      ...(name === 'caseClassification' ? { caseSubtype: '' } : {})
    }));
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Generate OB number if not provided
      const newOBNumber = formData.obNumber || `OB/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000)}`;
      
      const newEntry = {
        ...formData,
        obNumber: newOBNumber,
        // Map to expected backend fields
        type: formData.incidentType || 'Incident',
        description: formData.incidentDescription,
        reportedBy: formData.complainantName,
        officer: formData.recordingOfficer,
        date: formData.dateTime ? formData.dateTime.split('T')[0] : new Date().toISOString().split('T')[0],
        time: formData.dateTime ? formData.dateTime.split('T')[1] : new Date().toTimeString().split(' ')[0],
        details: `Case: ${formData.caseClassification} - ${formData.caseSubtype}. Action: ${formData.immediateAction}. Evidence: ${formData.evidenceDescription || 'None'}`
      };
      
      console.log('Saving new OB Entry to MongoDB:', newEntry);
      
      // Save to MongoDB via API
      const response = await fetch('/api/ob-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry)
      });

      if (!response.ok) {
        throw new Error(`Failed to save OB entry: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ OB Entry saved successfully:', result);
      
      // Refresh the OB entries list
      await fetchOBEntries();
      
      // Close sidebar and reset form
      setShowSidebar(false);
      resetForm();
      
      // Show success message
      alert('OB Entry saved successfully!');
      
    } catch (error) {
      console.error('❌ Failed to save OB entry:', error);
      alert('Failed to save OB entry. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      obNumber: '',
      dateTime: new Date().toISOString().slice(0, 16),
      location: '',
      caseClassification: '',
      caseSubtype: '',
      complainantName: '',
      complainantAge: '',
      complainantGender: '',
      complainantAddress: '',
      complainantPhone: '',
      complainantEmail: '',
      complainantIdNumber: '',
      incidentType: '',
      incidentDescription: '',
      incidentSeverity: 'Medium',
      witnessesPresent: false,
      witnessDetails: '',
      evidenceCollected: false,
      evidenceDescription: '',
      immediateAction: '',
      actionTakenBy: '',
      actionTime: '',
      referredTo: '',
      followUpRequired: false,
      followUpDate: '',
      followUpNotes: '',
      recordingOfficer: '',
      recordingOfficerBadge: '',
      supervisingOfficer: '',
      supervisingOfficerBadge: '',
      caseReference: '',
      courtReference: '',
      evidenceReference: '',
      reportReference: '',
      status: 'Pending',
      priority: 'Medium'
    });
  };

  const getClassificationBadgeClass = (classification) => {
    if (!classification) return 'classification-default';
    if (classification.includes('Criminal')) return 'classification-criminal';
    if (classification.includes('Civil')) return 'classification-civil';
    if (classification.includes('Traffic')) return 'classification-traffic';
    if (classification.includes('Juvenile')) return 'classification-juvenile';
    if (classification.includes('Administrative')) return 'classification-administrative';
    return 'classification-default';
  };

  const formatDateTime = (dateTime, date, time) => {
    if (dateTime) {
      return new Date(dateTime).toLocaleString();
    }
    if (date && time) {
      return `${date} ${time}`;
    }
    return 'N/A';
  };

  const formatOfficerInfo = (officer, badge) => {
    if (officer && badge) {
      return `${officer} (${badge})`;
    }
    return officer || 'N/A';
  };

  return (
    <div className="occurrence-book">
      <div className="ob-header">
        <h1>Occurrence Book (OB)</h1>
      </div>

      <div className="ob-controls">
        <div className="search-bar">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search OB entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters">
          <select 
            value={classificationFilter} 
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Classifications</option>
            {Object.keys(caseClassifications).map(classification => (
              <option key={classification} value={classification}>{classification}</option>
            ))}
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under review">Under Review</option>
            <option value="completed">Completed</option>
          </select>

          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
          </select>
        </div>

        <button 
          className="add-ob-btn" 
          onClick={() => setShowSidebar(true)}
        >
          <Plus className="btn-icon" />
          Add OB Entry
        </button>
      </div>

      <div className="ob-stats">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className={`stat-card ${stat.color}`}>
              <IconComponent className="stat-icon" />
              <div className="stat-info">
                <h3>{stat.title}</h3>
                <span className="stat-value">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="ob-content">
        <div className="ob-table">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>OB Number</th>
                  <th>Date & Time</th>
                  <th>Location</th>
                  <th>Case Classification</th>
                  <th>Incident Type</th>
                  <th>Complainant Name</th>
                  <th>Officer Name & Rank</th>
                  <th>Status / Follow-up</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">
                      <div className="no-data-message">
                        <FileText size={48} />
                        <p>No OB entries found</p>
                        <span>Try adjusting your search or filters</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentEntries.map((entry) => (
                    <tr key={entry.id || entry._id} className="table-row">
                      {editingEntry && (editingEntry.id === entry.id || editingEntry._id === entry._id) ? (
                        <>
                          <td className="ob-number">{entry.obNumber}</td>
                          <td>{formatDateTime(entry.dateTime, entry.date, entry.time)}</td>
                          <td>
                            <input
                              type="text"
                              name="location"
                              value={editingEntry.location || ''}
                              onChange={handleEditChange}
                              className="edit-input"
                            />
                          </td>
                          <td>
                            <select
                              name="caseClassification"
                              value={editingEntry.caseClassification || ''}
                              onChange={handleEditChange}
                              className="edit-select"
                            >
                              <option value="">Select...</option>
                              {Object.keys(caseClassifications).map(classification => (
                                <option key={classification} value={classification}>{classification}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              name="incidentType"
                              value={editingEntry.incidentType || editingEntry.type || ''}
                              onChange={handleEditChange}
                              className="edit-input"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="complainantName"
                              value={editingEntry.complainantName || editingEntry.reportedBy || ''}
                              onChange={handleEditChange}
                              className="edit-input"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="recordingOfficer"
                              value={editingEntry.recordingOfficer || editingEntry.officer || ''}
                              onChange={handleEditChange}
                              className="edit-input"
                            />
                          </td>
                          <td>
                            <select
                              name="status"
                              value={editingEntry.status}
                              onChange={handleEditChange}
                              className="edit-select"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Under Review">Under Review</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button onClick={handleUpdateSubmit} className="save-btn">
                                <Save size={14} />
                              </button>
                              <button onClick={() => setEditingEntry(null)} className="cancel-btn-small">
                                <X size={14} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="ob-number">{entry.obNumber}</td>
                          <td className="date-time">{formatDateTime(entry.dateTime, entry.date, entry.time)}</td>
                          <td className="location">{entry.location || 'N/A'}</td>
                          <td>
                            <span className={`classification-badge ${getClassificationBadgeClass(entry.caseClassification)}`}>
                              {entry.caseClassification || 'Unclassified'}
                            </span>
                          </td>
                          <td className="incident-type">{entry.incidentType || entry.type || 'N/A'}</td>
                          <td className="complainant">{entry.complainantName || entry.reportedBy || 'N/A'}</td>
                          <td className="officer">{formatOfficerInfo(entry.recordingOfficer || entry.officer, entry.recordingOfficerBadge)}</td>
                          <td>
                            <div className="status-container">
                              <span className={`status ${entry.status?.toLowerCase().replace(' ', '-') || 'pending'}`}>
                                {entry.status || 'Pending'}
                              </span>
                              {entry.followUpRequired && (
                                <span className="follow-up-indicator" title="Follow-up Required">
                                  <Clock size={12} />
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                onClick={() => handleEdit(entry)} 
                                className="edit-btn"
                                title="Edit Entry"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(entry.id || entry._id)} 
                                className="delete-btn"
                                title="Delete Entry"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              
              <div className="page-info">
                <span>Page {currentPage} of {totalPages}</span>
                <span className="entries-info">
                  Showing {indexOfFirstEntry + 1}-{Math.min(indexOfLastEntry, filteredEntries.length)} of {filteredEntries.length} entries
                </span>
              </div>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
                <ChevronRightIcon size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Sidebar Form */}
      {showSidebar && (
        <div className="ob-sidebar-overlay">
          <div className="ob-sidebar">
            <div className="sidebar-header">
              <h2>New OB Entry</h2>
              <button 
                className="close-btn"
                onClick={() => setShowSidebar(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="ob-form">
              
              {/* Basic Details */}
              <FormSection 
                title="Basic Details" 
                sectionKey="basic"
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
              >
                <div className="form-group">
                  <label>OB Number</label>
                  <input
                    type="text"
                    name="obNumber"
                    value={formData.obNumber}
                    onChange={handleInputChange}
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div className="form-group">
                  <label>Date & Time</label>
                  <input
                    type="datetime-local"
                    name="dateTime"
                    value={formData.dateTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </FormSection>

              {/* Case Classification */}
              <FormSection 
                title="Case Classification" 
                sectionKey="classification"
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
              >
                <div className="form-group">
                  <label>Case Classification</label>
                  <select
                    name="caseClassification"
                    value={formData.caseClassification}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Classification...</option>
                    {Object.keys(caseClassifications).map(classification => (
                      <option key={classification} value={classification}>
                        {classification}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.caseClassification && (
                  <div className="form-group">
                    <label>Case Subtype</label>
                    <select
                      name="caseSubtype"
                      value={formData.caseSubtype}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Subtype...</option>
                      {caseClassifications[formData.caseClassification].map(subtype => (
                        <option key={subtype} value={subtype}>
                          {subtype}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </FormSection>

              {/* Complainant Information */}
              <FormSection 
                title="Complainant Information" 
                sectionKey="complainant"
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
              >
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="complainantName"
                      value={formData.complainantName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      name="complainantAge"
                      value={formData.complainantAge}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      name="complainantGender"
                      value={formData.complainantGender}
                      onChange={handleInputChange}
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>ID Number</label>
                    <input
                      type="text"
                      name="complainantIdNumber"
                      value={formData.complainantIdNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    name="complainantAddress"
                    value={formData.complainantAddress}
                    onChange={handleInputChange}
                    rows="2"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="complainantPhone"
                      value={formData.complainantPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="complainantEmail"
                      value={formData.complainantEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </FormSection>

              {/* Incident Description */}
              <FormSection 
                title="Incident Description" 
                sectionKey="incident"
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
              >
                <div className="form-group">
                  <label>Incident Type</label>
                  <input
                    type="text"
                    name="incidentType"
                    value={formData.incidentType}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Detailed Description</label>
                  <textarea
                    name="incidentDescription"
                    value={formData.incidentDescription}
                    onChange={handleInputChange}
                    rows="4"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Severity</label>
                  <select
                    name="incidentSeverity"
                    value={formData.incidentSeverity}
                    onChange={handleInputChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="witnessesPresent"
                      checked={formData.witnessesPresent}
                      onChange={handleInputChange}
                    />
                    Witnesses Present
                  </label>
                </div>
                {formData.witnessesPresent && (
                  <div className="form-group">
                    <label>Witness Details</label>
                    <textarea
                      name="witnessDetails"
                      value={formData.witnessDetails}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                )}
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="evidenceCollected"
                      checked={formData.evidenceCollected}
                      onChange={handleInputChange}
                    />
                    Evidence Collected
                  </label>
                </div>
                {formData.evidenceCollected && (
                  <div className="form-group">
                    <label>Evidence Description</label>
                    <textarea
                      name="evidenceDescription"
                      value={formData.evidenceDescription}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                )}
              </FormSection>

              {/* Action Taken */}
              <FormSection 
                title="Action Taken" 
                sectionKey="action"
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
              >
                <div className="form-group">
                  <label>Immediate Action</label>
                  <textarea
                    name="immediateAction"
                    value={formData.immediateAction}
                    onChange={handleInputChange}
                    rows="3"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Action Taken By</label>
                    <input
                      type="text"
                      name="actionTakenBy"
                      value={formData.actionTakenBy}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Action Time</label>
                    <input
                      type="time"
                      name="actionTime"
                      value={formData.actionTime}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Referred To</label>
                  <input
                    type="text"
                    name="referredTo"
                    value={formData.referredTo}
                    onChange={handleInputChange}
                    placeholder="Department/Unit/Officer"
                  />
                </div>
              </FormSection>

              {/* Follow-up */}
              <FormSection 
                title="Follow-up" 
                sectionKey="followup"
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
              >
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="followUpRequired"
                      checked={formData.followUpRequired}
                      onChange={handleInputChange}
                    />
                    Follow-up Required
                  </label>
                </div>
                {formData.followUpRequired && (
                  <>
                    <div className="form-group">
                      <label>Follow-up Date</label>
                      <input
                        type="date"
                        name="followUpDate"
                        value={formData.followUpDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Follow-up Notes</label>
                      <textarea
                        name="followUpNotes"
                        value={formData.followUpNotes}
                        onChange={handleInputChange}
                        rows="2"
                      />
                    </div>
                  </>
                )}
              </FormSection>

              {/* Officer Details */}
              <FormSection 
                title="Officer Details" 
                sectionKey="officers"
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
              >
                <div className="form-row">
                  <div className="form-group">
                    <label>Recording Officer</label>
                    <input
                      type="text"
                      name="recordingOfficer"
                      value={formData.recordingOfficer}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Badge Number</label>
                    <input
                      type="text"
                      name="recordingOfficerBadge"
                      value={formData.recordingOfficerBadge}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Supervising Officer</label>
                    <input
                      type="text"
                      name="supervisingOfficer"
                      value={formData.supervisingOfficer}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Badge Number</label>
                    <input
                      type="text"
                      name="supervisingOfficerBadge"
                      value={formData.supervisingOfficerBadge}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </FormSection>

              {/* Reference Numbers */}
              <FormSection 
                title="Reference Numbers" 
                sectionKey="references"
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
              >
                <div className="form-row">
                  <div className="form-group">
                    <label>Case Reference</label>
                    <input
                      type="text"
                      name="caseReference"
                      value={formData.caseReference}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Court Reference</label>
                    <input
                      type="text"
                      name="courtReference"
                      value={formData.courtReference}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Evidence Reference</label>
                    <input
                      type="text"
                      name="evidenceReference"
                      value={formData.evidenceReference}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Report Reference</label>
                    <input
                      type="text"
                      name="reportReference"
                      value={formData.reportReference}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </FormSection>

              {/* Status and Priority */}
              <FormSection 
                title="Status & Priority" 
                sectionKey="status"
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
              >
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Completed">Completed</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>
              </FormSection>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  <Save size={16} />
                  Save OB Entry
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowSidebar(false)}
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OccurrenceBook;
