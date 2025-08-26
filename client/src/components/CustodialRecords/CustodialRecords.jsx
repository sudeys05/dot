
import React, { useState, useEffect } from 'react';
import './CustodialRecords.css';

const CustodialRecords = () => {
  const [inmates, setInmates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [classificationFilter, setClassificationFilter] = useState('All');
  const [selectedInmate, setSelectedInmate] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());
  const [idPhoto, setIdPhoto] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    released: 0,
    courtAppearances: 0
  });

  function getInitialFormData() {
    return {
      fullName: '',
      dateOfBirth: '',
      age: '',
      gender: '',
      nationality: '',
      maritalStatus: '',
      education: '',
      religion: '',
      address: '',
      permanentAddress: '',
      admissionDate: new Date().toISOString().split('T')[0],
      charges: [],
      sentence: '',
      courtReference: '',
      bailPosted: 'false',
      emergencyContactName: '',
      relationship: '',
      contactPhone: '',
      contactAddress: '',
      medicalConditions: '',
      allergies: '',
      doctorNotes: '',
      suicideRisk: 'false',
      behaviorReports: '',
      disciplinaryActions: '',
      privileges: '',
      riskLevel: 'Medium',
      classification: 'Medium Security',
      status: 'Active'
    };
  }

  const chargeOptions = [
    'Theft', 'Assault', 'Robbery', 'Burglary', 'Drug Possession',
    'Fraud', 'Vandalism', 'Public Disorder', 'Traffic Violations',
    'Domestic Violence', 'Weapons Charges', 'Murder', 'Kidnapping',
    'Money Laundering', 'Cybercrime', 'Arson'
  ];

  const relationshipOptions = [
    'Father', 'Mother', 'Spouse', 'Sibling', 'Child',
    'Guardian', 'Friend', 'Lawyer', 'Other'
  ];

  useEffect(() => {
    fetchInmates();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [inmates]);

  const fetchInmates = async () => {
    try {
      console.log('🔍 Fetching custodial records...');
      const response = await fetch('/api/custodial-records');
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Received custodial records:', data);
        setInmates(data.inmates || []);
      } else {
        console.error('Failed to fetch custodial records');
        setInmates([]);
      }
    } catch (error) {
      console.error('Error fetching custodial records:', error);
      setInmates([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = inmates.length;
    const active = inmates.filter(inmate => inmate.status === 'Active').length;
    const released = inmates.filter(inmate => inmate.status === 'Released').length;
    const courtAppearances = inmates.filter(inmate => inmate.status === 'Court Appearance').length;
    
    setStats({ total, active, released, courtAppearances });
  };

  const handleAddInmate = () => {
    setFormData(getInitialFormData());
    setSelectedInmate(null);
    setIsEditMode(false);
    setIsAddModalOpen(true);
    setIdPhoto(null);
  };

  const handleEditInmate = (inmate) => {
    setFormData({
      ...inmate,
      charges: Array.isArray(inmate.charges) ? inmate.charges : [],
      dateOfBirth: inmate.dateOfBirth ? inmate.dateOfBirth.split('T')[0] : '',
      admissionDate: inmate.admissionDate ? inmate.admissionDate.split('T')[0] : ''
    });
    setSelectedInmate(inmate);
    setIsEditMode(true);
    setIsAddModalOpen(true);
    setIdPhoto(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-calculate age from date of birth
    if (name === 'dateOfBirth' && value) {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      setFormData(prev => ({ ...prev, age }));
    }
  };

  const handleChargeChange = (charge) => {
    setFormData(prev => ({
      ...prev,
      charges: prev.charges.includes(charge)
        ? prev.charges.filter(c => c !== charge)
        : [...prev.charges, charge]
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdPhoto(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'charges') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Add photo if selected
      if (idPhoto) {
        submitData.append('idPhoto', idPhoto);
      }

      const url = isEditMode 
        ? `/api/custodial-records/${selectedInmate.id}`
        : '/api/custodial-records';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: submitData
      });

      if (response.ok) {
        await fetchInmates();
        setIsAddModalOpen(false);
        setFormData(getInitialFormData());
        setIdPhoto(null);
      } else {
        const errorData = await response.json();
        alert(`Failed to ${isEditMode ? 'update' : 'create'} record: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error ${isEditMode ? 'updating' : 'creating'} record`);
    }
  };

  const handleDelete = async (inmateId) => {
    if (window.confirm('Are you sure you want to delete this custodial record?')) {
      try {
        const response = await fetch(`/api/custodial-records/${inmateId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await fetchInmates();
        } else {
          alert('Failed to delete record');
        }
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Error deleting record');
      }
    }
  };

  const filteredInmates = inmates.filter(inmate => {
    const matchesSearch = inmate.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inmate.prisonerNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inmate.status === statusFilter;
    const matchesRisk = riskFilter === 'All' || inmate.riskLevel === riskFilter;
    const matchesClassification = classificationFilter === 'All' || inmate.classification === classificationFilter;
    
    return matchesSearch && matchesStatus && matchesRisk && matchesClassification;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#28a745';
      case 'Released': return '#6c757d';
      case 'Transferred': return '#007bff';
      case 'Court Appearance': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return '#28a745';
      case 'Medium': return '#ffc107';
      case 'High': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return <div className="loading">Loading custodial records...</div>;
  }

  return (
    <div className="custodial-records">
      <div className="custodial-header">
        <h1>Custodial Records Management</h1>
        <button className="add-btn" onClick={handleAddInmate}>
          + Add New Inmate
        </button>
      </div>

      {/* Statistics Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-card">
          <h3>{stats.total}</h3>
          <p>Total Inmates</p>
        </div>
        <div className="stat-card">
          <h3>{stats.active}</h3>
          <p>Active</p>
        </div>
        <div className="stat-card">
          <h3>{stats.released}</h3>
          <p>Released</p>
        </div>
        <div className="stat-card">
          <h3>{stats.courtAppearances}</h3>
          <p>Court Appearances</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or prisoner number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Released">Released</option>
          <option value="Transferred">Transferred</option>
          <option value="Court Appearance">Court Appearance</option>
        </select>

        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Risk Levels</option>
          <option value="Low">Low Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="High">High Risk</option>
        </select>

        <select
          value={classificationFilter}
          onChange={(e) => setClassificationFilter(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Classifications</option>
          <option value="Minimum Security">Minimum Security</option>
          <option value="Medium Security">Medium Security</option>
          <option value="Maximum Security">Maximum Security</option>
        </select>
      </div>

      {/* Inmates Table */}
      <div className="inmates-table">
        <table>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Prisoner Number</th>
              <th>Full Name</th>
              <th>Age</th>
              <th>Charges</th>
              <th>Status</th>
              <th>Risk Level</th>
              <th>Classification</th>
              <th>Admission Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInmates.map((inmate) => (
              <tr key={inmate.id || inmate._id}>
                <td>
                  {inmate.idPhoto ? (
                    <img
                      src={`/uploads/${inmate.idPhoto.filename}`}
                      alt="ID Photo"
                      className="inmate-photo"
                    />
                  ) : (
                    <div className="no-photo">No Photo</div>
                  )}
                </td>
                <td>{inmate.prisonerNumber}</td>
                <td>{inmate.fullName}</td>
                <td>{inmate.age}</td>
                <td>
                  <div className="charges-list">
                    {Array.isArray(inmate.charges) 
                      ? inmate.charges.slice(0, 2).join(', ')
                      : inmate.charges || 'No charges'
                    }
                    {Array.isArray(inmate.charges) && inmate.charges.length > 2 && '...'}
                  </div>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(inmate.status) }}
                  >
                    {inmate.status}
                  </span>
                </td>
                <td>
                  <span 
                    className="risk-badge"
                    style={{ backgroundColor: getRiskColor(inmate.riskLevel) }}
                  >
                    {inmate.riskLevel}
                  </span>
                </td>
                <td>{inmate.classification}</td>
                <td>{new Date(inmate.admissionDate).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="edit-btn"
                      onClick={() => setSelectedInmate(inmate)}
                    >
                      View
                    </button>
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditInmate(inmate)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(inmate.id || inmate._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Inmate Record' : 'Add New Inmate'}</h2>
              <button 
                className="close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="inmate-form">
              {/* Personal Information */}
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Nationality</label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Marital Status</label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Education Level</label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Education</option>
                      <option value="None">None</option>
                      <option value="Primary">Primary</option>
                      <option value="Secondary">Secondary</option>
                      <option value="High School">High School</option>
                      <option value="College">College</option>
                      <option value="University">University</option>
                      <option value="Doctorate">Doctorate</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Religion</label>
                    <input
                      type="text"
                      name="religion"
                      value={formData.religion}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label>ID Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </div>
              </div>

              {/* Legal Information */}
              <div className="form-section">
                <h3>Legal Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Admission Date *</label>
                    <input
                      type="date"
                      name="admissionDate"
                      value={formData.admissionDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Sentence</label>
                    <input
                      type="text"
                      name="sentence"
                      value={formData.sentence}
                      onChange={handleInputChange}
                      placeholder="e.g., 5 years"
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

                  <div className="form-group">
                    <label>Bail Posted</label>
                    <select
                      name="bailPosted"
                      value={formData.bailPosted}
                      onChange={handleInputChange}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Charges</label>
                  <div className="charges-grid">
                    {chargeOptions.map(charge => (
                      <label key={charge} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.charges.includes(charge)}
                          onChange={() => handleChargeChange(charge)}
                        />
                        {charge}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="form-section">
                <h3>Emergency Contact</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Contact Name</label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Relationship</label>
                    <select
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Relationship</option>
                      {relationshipOptions.map(rel => (
                        <option key={rel} value={rel}>{rel}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Contact Phone</label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Contact Address</label>
                  <textarea
                    name="contactAddress"
                    value={formData.contactAddress}
                    onChange={handleInputChange}
                    rows="2"
                  />
                </div>
              </div>

              {/* Medical Information */}
              <div className="form-section">
                <h3>Medical Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Suicide Risk</label>
                    <select
                      name="suicideRisk"
                      value={formData.suicideRisk}
                      onChange={handleInputChange}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Medical Conditions</label>
                  <textarea
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="List any medical conditions..."
                  />
                </div>

                <div className="form-group">
                  <label>Allergies</label>
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="List any known allergies..."
                  />
                </div>

                <div className="form-group">
                  <label>Doctor Notes</label>
                  <textarea
                    name="doctorNotes"
                    value={formData.doctorNotes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Medical professional notes..."
                  />
                </div>
              </div>

              {/* Security & Behavior */}
              <div className="form-section">
                <h3>Security & Behavior</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Risk Level</label>
                    <select
                      name="riskLevel"
                      value={formData.riskLevel}
                      onChange={handleInputChange}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Security Classification</label>
                    <select
                      name="classification"
                      value={formData.classification}
                      onChange={handleInputChange}
                    >
                      <option value="Minimum Security">Minimum Security</option>
                      <option value="Medium Security">Medium Security</option>
                      <option value="Maximum Security">Maximum Security</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Released">Released</option>
                      <option value="Transferred">Transferred</option>
                      <option value="Court Appearance">Court Appearance</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Behavior Reports</label>
                  <textarea
                    name="behaviorReports"
                    value={formData.behaviorReports}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Behavioral observations and progress notes..."
                  />
                </div>

                <div className="form-group">
                  <label>Disciplinary Actions</label>
                  <textarea
                    name="disciplinaryActions"
                    value={formData.disciplinaryActions}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Record violations, sanctions, and corrective measures..."
                  />
                </div>

                <div className="form-group">
                  <label>Privileges</label>
                  <textarea
                    name="privileges"
                    value={formData.privileges}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Library access, recreation time, education programs, work details..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit">
                  {isEditMode ? 'Update Record' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {selectedInmate && !isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content detail-modal">
            <div className="modal-header">
              <h2>Inmate Details - {selectedInmate.fullName}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedInmate(null)}
              >
                ×
              </button>
            </div>

            <div className="detail-content">
              <div className="detail-grid">
                {/* Personal Information */}
                <div className="detail-section">
                  <h3>Personal Information</h3>
                  <div className="info-grid">
                    <div><strong>Prisoner Number:</strong> {selectedInmate.prisonerNumber}</div>
                    <div><strong>Full Name:</strong> {selectedInmate.fullName}</div>
                    <div><strong>Date of Birth:</strong> {selectedInmate.dateOfBirth ? new Date(selectedInmate.dateOfBirth).toLocaleDateString() : 'Not provided'}</div>
                    <div><strong>Age:</strong> {selectedInmate.age || 'Not calculated'}</div>
                    <div><strong>Gender:</strong> {selectedInmate.gender || 'Not specified'}</div>
                    <div><strong>Nationality:</strong> {selectedInmate.nationality || 'Not provided'}</div>
                    <div><strong>Marital Status:</strong> {selectedInmate.maritalStatus || 'Not provided'}</div>
                    <div><strong>Education:</strong> {selectedInmate.education || 'Not provided'}</div>
                    <div><strong>Religion:</strong> {selectedInmate.religion || 'Not provided'}</div>
                    <div><strong>Address:</strong> {selectedInmate.address || 'Not provided'}</div>
                  </div>
                  {selectedInmate.idPhoto && (
                    <div className="photo-section">
                      <h4>ID Photo</h4>
                      <img
                        src={`/uploads/${selectedInmate.idPhoto.filename}`}
                        alt="ID Photo"
                        className="detail-photo"
                      />
                    </div>
                  )}
                </div>

                {/* Legal Information */}
                <div className="detail-section">
                  <h3>Legal Information</h3>
                  <div className="info-grid">
                    <div><strong>Admission Date:</strong> {new Date(selectedInmate.admissionDate).toLocaleDateString()}</div>
                    <div><strong>Charges:</strong> {Array.isArray(selectedInmate.charges) ? selectedInmate.charges.join(', ') : selectedInmate.charges || 'No charges listed'}</div>
                    <div><strong>Sentence:</strong> {selectedInmate.sentence || 'Not specified'}</div>
                    <div><strong>Court Reference:</strong> {selectedInmate.courtReference || 'Not provided'}</div>
                    <div><strong>Bail Posted:</strong> {selectedInmate.bailPosted === 'true' ? 'Yes' : 'No'}</div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="detail-section">
                  <h3>Emergency Contact</h3>
                  <div className="info-grid">
                    <div><strong>Contact Name:</strong> {selectedInmate.emergencyContactName || 'Not provided'}</div>
                    <div><strong>Relationship:</strong> {selectedInmate.relationship || 'Not specified'}</div>
                    <div><strong>Phone:</strong> {selectedInmate.contactPhone || 'Not provided'}</div>
                    <div><strong>Address:</strong> {selectedInmate.contactAddress || 'Not provided'}</div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="detail-section">
                  <h3>Medical Information</h3>
                  <div className="info-grid">
                    <div><strong>Suicide Risk:</strong> <span style={{color: selectedInmate.suicideRisk === 'true' ? '#dc3545' : '#28a745'}}>{selectedInmate.suicideRisk === 'true' ? 'Yes' : 'No'}</span></div>
                    <div><strong>Medical Conditions:</strong> {selectedInmate.medicalConditions || 'None reported'}</div>
                    <div><strong>Allergies:</strong> {selectedInmate.allergies || 'None reported'}</div>
                  </div>
                  {selectedInmate.doctorNotes && (
                    <div>
                      <strong>Doctor Notes:</strong>
                      <p className="custody-info">{selectedInmate.doctorNotes}</p>
                    </div>
                  )}
                </div>

                {/* Security & Behavior */}
                <div className="detail-section">
                  <h3>Security & Behavior</h3>
                  <div className="info-grid">
                    <div><strong>Status:</strong> <span className="status-badge" style={{ backgroundColor: getStatusColor(selectedInmate.status) }}>{selectedInmate.status}</span></div>
                    <div><strong>Risk Level:</strong> <span className="risk-badge" style={{ backgroundColor: getRiskColor(selectedInmate.riskLevel) }}>{selectedInmate.riskLevel}</span></div>
                    <div><strong>Classification:</strong> {selectedInmate.classification}</div>
                  </div>
                  
                  {selectedInmate.behaviorReports && (
                    <div>
                      <strong>Behavior Reports:</strong>
                      <p className="custody-info">{selectedInmate.behaviorReports}</p>
                    </div>
                  )}
                  
                  {selectedInmate.disciplinaryActions && (
                    <div>
                      <strong>Disciplinary Actions:</strong>
                      <p className="custody-info">{selectedInmate.disciplinaryActions}</p>
                    </div>
                  )}
                  
                  {selectedInmate.privileges && (
                    <div>
                      <strong>Privileges:</strong>
                      <p className="custody-info">{selectedInmate.privileges}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustodialRecords;
