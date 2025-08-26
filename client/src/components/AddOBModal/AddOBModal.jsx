import React, { useState } from 'react';
import { X, Save, AlertCircle, Minimize2, Maximize2, Square } from 'lucide-react';
import './AddOBModal.css';

const AddOBModal = ({ isOpen, onClose, onAddOB }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Incident',
    description: '',
    reportedBy: '',
    officer: '',
    location: '',
    status: 'Pending',
    details: ''
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.reportedBy.trim()) {
      newErrors.reportedBy = 'Reported by field is required';
    }
    
    if (!formData.officer.trim()) {
      newErrors.officer = 'Officer name is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const now = new Date();
      const newOBEntry = {
        id: `OB-${Date.now()}`,
        obNumber: `OB/${now.getFullYear()}/${String(Date.now()).slice(-4)}`,
        type: formData.type,
        description: formData.description,
        reportedBy: formData.reportedBy,
        officer: formData.officer,
        location: formData.location,
        status: formData.status,
        details: formData.details,
        date: now.toISOString().split('T')[0],
        dateTime: now.toLocaleString(),
        createdAt: now.toISOString()
      };
      
      onAddOB(newOBEntry);
      
      // Reset form
      setFormData({
        type: 'Incident',
        description: '',
        reportedBy: '',
        officer: '',
        location: '',
        status: 'Pending',
        details: ''
      });
      
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      type: 'Incident',
      description: '',
      reportedBy: '',
      officer: '',
      location: '',
      status: 'Pending',
      details: ''
    });
    setErrors({});
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

  const modalClass = `modal-content ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized' : ''}`;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add OB Entry</h2>
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
          <form onSubmit={handleSubmit} className="ob-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="Incident">Incident</option>
                <option value="Complaint">Complaint</option>
                <option value="Arrest">Arrest</option>
                <option value="Accident">Accident</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the occurrence"
              className={errors.description ? 'error' : ''}
            />
            {errors.description && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.description}
              </span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reportedBy">Reported By *</label>
              <input
                type="text"
                id="reportedBy"
                name="reportedBy"
                value={formData.reportedBy}
                onChange={handleInputChange}
                placeholder="Name of person reporting"
                className={errors.reportedBy ? 'error' : ''}
              />
              {errors.reportedBy && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.reportedBy}
                </span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="officer">Recording Officer *</label>
              <input
                type="text"
                id="officer"
                name="officer"
                value={formData.officer}
                onChange={handleInputChange}
                placeholder="Officer recording the entry"
                className={errors.officer ? 'error' : ''}
              />
              {errors.officer && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.officer}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Location where occurrence happened"
              className={errors.location ? 'error' : ''}
            />
            {errors.location && (
              <span className="error-message">
                <AlertCircle size={14} />
                {errors.location}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="details">Additional Details</label>
            <textarea
              id="details"
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              placeholder="Additional details about the occurrence (optional)"
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              <Save size={16} />
              Add Entry
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default AddOBModal;