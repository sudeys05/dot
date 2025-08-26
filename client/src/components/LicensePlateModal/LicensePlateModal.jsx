import React, { useState } from 'react';
import { X, Save, AlertCircle, Upload, Search, Minimize2, Maximize2, Square } from 'lucide-react';
import './LicensePlateModal.css';

const LicensePlateModal = ({ isOpen, onClose, onAddPlate, onSearchPlate, plates }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [formData, setFormData] = useState({
    plateNumber: '',
    ownerName: '',
    fatherName: '',
    motherName: '',
    idNumber: '',
    passportNumber: '',
    ownerImage: null
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          ownerImage: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.plateNumber.trim()) {
      newErrors.plateNumber = 'License plate number is required';
    }
    
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }
    
    if (!formData.fatherName.trim()) {
      newErrors.fatherName = 'Father name is required';
    }
    
    if (!formData.motherName.trim()) {
      newErrors.motherName = 'Mother name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const newPlate = {
        id: `LP-${Date.now()}`,
        plateNumber: formData.plateNumber.toUpperCase(),
        ownerName: formData.ownerName,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        idNumber: formData.idNumber,
        passportNumber: formData.passportNumber,
        ownerImage: formData.ownerImage,
        dateAdded: new Date().toISOString().split('T')[0]
      };
      
      onAddPlate(newPlate);
      
      // Reset form
      setFormData({
        plateNumber: '',
        ownerName: '',
        fatherName: '',
        motherName: '',
        idNumber: '',
        passportNumber: '',
        ownerImage: null
      });
      
      onClose();
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const result = plates.find(plate => 
        plate.plateNumber.toLowerCase() === searchTerm.toLowerCase()
      );
      setSearchResult(result || 'not_found');
    }
  };

  const handleClose = () => {
    setFormData({
      plateNumber: '',
      ownerName: '',
      fatherName: '',
      motherName: '',
      idNumber: '',
      passportNumber: '',
      ownerImage: null
    });
    setErrors({});
    setSearchTerm('');
    setSearchResult(null);
    setEnlargedImage(null);
    setActiveTab('add');
    onClose();
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    setIsMaximized(false);
  };

  if (!isOpen) return null;

  const modalClass = `modal-content license-plate-modal ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized' : ''}`;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>License Plate Management</h2>
          <div className="modal-controls">
            <button className="minimize-btn" onClick={handleMinimize}>
              <Minimize2 size={16} />
            </button>
            <button className="maximize-btn" onClick={handleMaximize}>
              {isMaximized ? <Square size={16} /> : <Maximize2 size={16} />}
            </button>
            <button className="close-btn" onClick={handleClose}>
              <X size={20} />
            </button>
          </div>
        </div>
        
        {!isMinimized && (
          <>
            <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            Add Plate
          </button>
          <button 
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Search Plate
          </button>
        </div>
          </>
        )}

        {!isMinimized && activeTab === 'add' && (
          <form onSubmit={handleSubmit} className="plate-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="plateNumber">License Plate Number *</label>
                <input
                  type="text"
                  id="plateNumber"
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleInputChange}
                  placeholder="Enter plate number"
                  className={errors.plateNumber ? 'error' : ''}
                />
                {errors.plateNumber && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.plateNumber}
                  </span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="ownerName">Owner Name *</label>
                <input
                  type="text"
                  id="ownerName"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  placeholder="Enter owner name"
                  className={errors.ownerName ? 'error' : ''}
                />
                {errors.ownerName && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.ownerName}
                  </span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fatherName">Father Name *</label>
                <input
                  type="text"
                  id="fatherName"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  placeholder="Enter father name"
                  className={errors.fatherName ? 'error' : ''}
                />
                {errors.fatherName && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.fatherName}
                  </span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="motherName">Mother Name *</label>
                <input
                  type="text"
                  id="motherName"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  placeholder="Enter mother name"
                  className={errors.motherName ? 'error' : ''}
                />
                {errors.motherName && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.motherName}
                  </span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="idNumber">ID Number (Optional)</label>
                <input
                  type="text"
                  id="idNumber"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  placeholder="Enter ID number"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="passportNumber">Passport Number (Optional)</label>
                <input
                  type="text"
                  id="passportNumber"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleInputChange}
                  placeholder="Enter passport number"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="ownerImage">Owner Image</label>
              <div className="image-upload">
                <input
                  type="file"
                  id="ownerImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="ownerImage" className="upload-btn">
                  <Upload size={16} />
                  Upload Image
                </label>
                {formData.ownerImage && (
                  <div className="image-preview">
                    <img src={formData.ownerImage} alt="Owner" />
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                <Save size={16} />
                Add Plate
              </button>
            </div>
          </form>
        )}

        {!isMinimized && activeTab === 'search' && (
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter license plate number"
                className="search-input"
              />
              <button onClick={handleSearch} className="search-btn">
                <Search size={16} />
                Search
              </button>
            </div>

            {searchResult && (
              <div className="search-results">
                {searchResult === 'not_found' ? (
                  <div className="no-results">
                    <AlertCircle size={48} />
                    <h3>No Results Found</h3>
                    <p>No vehicle found with plate number: {searchTerm}</p>
                  </div>
                ) : (
                  <div className="result-card">
                    <div className="result-header">
                      <h3>Vehicle Information</h3>
                      <span className="plate-number">{searchResult.plateNumber}</span>
                    </div>
                    <div className="result-content">
                      <div className="owner-info">
                        <div className="info-group">
                          <label>Owner Name:</label>
                          <span>{searchResult.ownerName}</span>
                        </div>
                        <div className="info-group">
                          <label>Father Name:</label>
                          <span>{searchResult.fatherName}</span>
                        </div>
                        <div className="info-group">
                          <label>Mother Name:</label>
                          <span>{searchResult.motherName}</span>
                        </div>
                        {searchResult.idNumber && (
                          <div className="info-group">
                            <label>ID Number:</label>
                            <span>{searchResult.idNumber}</span>
                          </div>
                        )}
                        {searchResult.passportNumber && (
                          <div className="info-group">
                            <label>Passport Number:</label>
                            <span>{searchResult.passportNumber}</span>
                          </div>
                        )}
                        <div className="info-group">
                          <label>Date Added:</label>
                          <span>{searchResult.dateAdded}</span>
                        </div>
                      </div>
                      {searchResult.ownerImage && (
                        <div className="owner-image">
                          <img 
                            src={searchResult.ownerImage} 
                            alt="Owner" 
                            onClick={() => setEnlargedImage({
                              src: searchResult.ownerImage,
                              name: searchResult.ownerName,
                              plate: searchResult.plateNumber
                            })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {enlargedImage && (
        <div className="image-modal-overlay" onClick={() => setEnlargedImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="image-modal-header">
              <h3>{enlargedImage.name} - {enlargedImage.plate}</h3>
              <button className="image-close-btn" onClick={() => setEnlargedImage(null)}>
                <X size={20} />
              </button>
            </div>
            <img 
              src={enlargedImage.src} 
              alt="Owner" 
              className="enlarged-image"
            />
            <div className="image-info">
              Click outside or press the X button to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicensePlateModal;