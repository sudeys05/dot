import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Plus, 
  Search, 
  Edit2, 
  Eye, 
  RotateCcw,
  User,
  FileText,
  Calendar,
  MapPin
} from 'lucide-react';
import './LicensePlates.css';

const LicensePlates = () => {
  const [plates, setPlates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'detail', 'edit'
  const [selectedPlate, setSelectedPlate] = useState(null);

  const fetchPlates = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Fetching license plates from frontend...');
      const response = await fetch('/api/mongo/license-plates');
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Received license plates data:', data);
        setPlates(data.licensePlates || []);
        console.log('✅ License plates set in state:', (data.licensePlates || []).length, 'plates');
        setError('');
      } else {
        console.error('❌ Failed to fetch license plates - Response not OK');
        setError('Failed to fetch license plates');
      }
    } catch (error) {
      console.error('❌ Network error fetching license plates:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlate = async (plateData) => {
    try {
      console.log('🔍 Creating license plate from frontend:', plateData);
      const response = await fetch('/api/mongo/license-plates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plateData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ License plate created successfully:', result);
        await fetchPlates();
        navigateToView('list'); // Navigate back to list after successful creation
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to create license plate:', errorData);
        setError(`Failed to create license plate: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Network error during creation:', error);
      setError(`Network error during creation: ${error.message}`);
    }
  };


  useEffect(() => {
    fetchPlates();
  }, []);

  const filteredPlates = plates.filter(plate =>
    plate.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plate.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plate.idNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navigateToView = (view, plate = null) => {
    setCurrentView(view);
    setSelectedPlate(plate);
  };

  const goBack = () => {
    if (currentView === 'detail') {
      setCurrentView('list');
    } else if (currentView === 'edit') {
      setCurrentView('detail');
    } else {
      setCurrentView('list');
    }
    if (currentView === 'create') {
      setSelectedPlate(null);
    }
  };

  const PlatesList = () => (
    <div className="plates-list">
      <div className="plates-header">
        <div className="header-content">
          <Car className="header-icon" />
          <div>
            <h1>License Plates Management</h1>
            <p>Manage vehicle registration records</p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-btn" 
            onClick={fetchPlates}
            disabled={isLoading}
            title="Refresh plates list"
          >
            <RotateCcw size={18} className={isLoading ? 'spinning' : ''} />
            Refresh
          </button>
          <button className="add-plate-btn" onClick={() => navigateToView('create')}>
            <Plus size={18} />
            Add Plate
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by plate number, owner name, or ID number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="plates-grid">
        {isLoading ? (
          <div className="loading-state">Loading license plates...</div>
        ) : filteredPlates.length === 0 ? (
          <div className="empty-state">
            <Car size={48} />
            <h3>No license plates found</h3>
            <p>Add a new license plate or adjust your search filters</p>
          </div>
        ) : (
          filteredPlates.map((plate) => (
            <div key={plate.id} className="plate-card" onClick={() => navigateToView('detail', plate)}>
              <div className="plate-header">
                <div className="plate-number">
                  <Car size={20} />
                  <span className="plate-text">{plate.plateNumber}</span>
                </div>
              </div>
              <div className="plate-body">
                <div className="owner-info">
                  <h4>{plate.ownerName}</h4>
                  {plate.idNumber && (
                    <p className="id-number">ID: {plate.idNumber}</p>
                  )}
                  {plate.passportNumber && (
                    <p className="passport-number">Passport: {plate.passportNumber}</p>
                  )}
                </div>
                <div className="plate-meta">
                  <p className="created-date">
                    <Calendar size={14} />
                    Added: {new Date(plate.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const CreatePlateForm = () => {
    const [formData, setFormData] = useState({
      plateNumber: '',
      ownerName: '',
      fatherName: '',
      motherName: '',
      idNumber: '',
      passportNumber: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    };

    const validateForm = () => {
      const newErrors = {};
      if (!formData.plateNumber.trim()) newErrors.plateNumber = 'Plate number is required';
      if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';

      if (!formData.idNumber.trim() && !formData.passportNumber.trim()) {
        newErrors.identification = 'Either ID number or passport number is required';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        const response = await fetch('/api/mongo/license-plates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          await fetchPlates();
          goBack();
        } else {
          const errorData = await response.json();
          setErrors({ submit: errorData.message || 'Failed to add license plate' });
        }
      } catch (error) {
        setErrors({ submit: 'Network error. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="plate-form-container">
        <div className="form-header">
          <button className="back-btn" onClick={goBack}>
            <Car size={20} />
            Back to Plates
          </button>
          <h1>Add New License Plate</h1>
        </div>

        <form onSubmit={handleSubmit} className="plate-creation-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="plateNumber">Plate Number *</label>
              <input
                type="text"
                id="plateNumber"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleInputChange}
                placeholder="Enter plate number"
                className={errors.plateNumber ? 'error' : ''}
                style={{ textTransform: 'uppercase' }}
              />
              {errors.plateNumber && <span className="error-text">{errors.plateNumber}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="ownerName">Owner Name *</label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                placeholder="Enter owner's full name"
                className={errors.ownerName ? 'error' : ''}
              />
              {errors.ownerName && <span className="error-text">{errors.ownerName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="fatherName">Father's Name</label>
              <input
                type="text"
                id="fatherName"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleInputChange}
                placeholder="Enter father's name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="motherName">Mother's Name</label>
              <input
                type="text"
                id="motherName"
                name="motherName"
                value={formData.motherName}
                onChange={handleInputChange}
                placeholder="Enter mother's name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="idNumber">ID Number</label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                placeholder="Enter national ID number"
                className={errors.identification ? 'error' : ''}
              />
            </div>

            <div className="form-group">
              <label htmlFor="passportNumber">Passport Number</label>
              <input
                type="text"
                id="passportNumber"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleInputChange}
                placeholder="Enter passport number"
                className={errors.identification ? 'error' : ''}
              />
              {errors.identification && <span className="error-text">{errors.identification}</span>}
            </div>
          </div>

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
              {isSubmitting ? 'Adding...' : 'Add License Plate'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const PlateDetail = () => (
    <div className="plate-detail">
      <div className="detail-header">
        <button className="back-btn" onClick={goBack}>
          <Car size={20} />
          Back to Plates
        </button>
        <div className="detail-actions">
          <button onClick={() => navigateToView('edit', selectedPlate)}>
            <Edit2 size={16} />
            Edit Plate
          </button>
        </div>
      </div>

      <div className="plate-info-panel">
        <div className="panel-header">
          <div className="plate-display">
            <Car size={32} />
            <h1>{selectedPlate?.plateNumber}</h1>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-section">
            <h3>Owner Information</h3>
            <div className="info-grid">
              <div><strong>Full Name:</strong> {selectedPlate?.ownerName}</div>
              <div><strong>Father's Name:</strong> {selectedPlate?.fatherName || 'Not provided'}</div>
              <div><strong>Mother's Name:</strong> {selectedPlate?.motherName || 'Not provided'}</div>
              <div><strong>ID Number:</strong> {selectedPlate?.idNumber || 'Not provided'}</div>
              <div><strong>Passport Number:</strong> {selectedPlate?.passportNumber || 'Not provided'}</div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Registration Details</h3>
            <div className="info-grid">
              <div><strong>Plate Number:</strong> {selectedPlate?.plateNumber}</div>
              <div><strong>Added Date:</strong> {new Date(selectedPlate?.createdAt).toLocaleString()}</div>
              <div><strong>Last Updated:</strong> {new Date(selectedPlate?.updatedAt).toLocaleString()}</div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Linked Cases</h3>
            <div className="linked-items">
              <p>No linked cases found for this license plate.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  switch (currentView) {
    case 'detail':
      return <PlateDetail />;
    case 'create':
      return <CreatePlateForm />;
    default:
      return <PlatesList />;
  }
};

export default LicensePlates;