
import React, { useState } from 'react';
import { X, User, Badge, Phone, Mail, Calendar, Shield, Users, Clock, AlertCircle } from 'lucide-react';
import './AddOfficerModal.css';

const AddOfficerModal = ({ isOpen, onClose, onSubmit, editingOfficer = null }) => {
  const [formData, setFormData] = useState({
    firstName: editingOfficer?.firstName || '',
    lastName: editingOfficer?.lastName || '',
    badgeNumber: editingOfficer?.badgeNumber || '',
    department: editingOfficer?.department || '',
    position: editingOfficer?.position || '',
    rank: editingOfficer?.rank || '',
    email: editingOfficer?.email || '',
    phone: editingOfficer?.phone || '',
    dateJoined: editingOfficer?.dateJoined || '',
    specialization: editingOfficer?.specialization || '',
    yearsOfService: editingOfficer?.yearsOfService || '',
    supervisor: editingOfficer?.supervisor || '',
    shift: editingOfficer?.shift || 'Day',
    status: editingOfficer?.status || 'active',
    emergencyContact: editingOfficer?.emergencyContact || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = [
    'Criminal Investigation',
    'Traffic Police',
    'Community Relations',
    'Special Operations',
    'Cybercrime Unit',
    'Drug Enforcement',
    'Emergency Response',
    'Administrative',
    'Forensics'
  ];

  const positions = [
    'Police Officer',
    'Detective',
    'Sergeant',
    'Lieutenant',
    'Captain',
    'Inspector',
    'Commissioner',
    'Specialist'
  ];

  const ranks = [
    'Police Constable',
    'Senior Police Constable',
    'Corporal',
    'Sergeant',
    'Senior Sergeant',
    'Inspector',
    'Chief Inspector',
    'Superintendent',
    'Senior Superintendent',
    'Assistant Commissioner',
    'Deputy Commissioner',
    'Commissioner'
  ];

  const shifts = ['Day', 'Night', 'Swing', 'Rotating'];
  const statuses = ['active', 'inactive', 'suspended', 'retired'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.position) {
      newErrors.position = 'Position is required';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting officer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="officer-modal">
        <div className="modal-header">
          <h2>
            <User size={24} />
            {editingOfficer ? 'Edit Officer' : 'Add New Officer'}
          </h2>
          <button 
            type="button" 
            onClick={onClose}
            className="close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="officer-form">
          <div className="form-grid">
            {/* Basic Information */}
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.firstName}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter last name"
                className={errors.lastName ? 'error' : ''}
              />
              {errors.lastName && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.lastName}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="badgeNumber">Badge Number</label>
              <input
                type="text"
                id="badgeNumber"
                name="badgeNumber"
                value={formData.badgeNumber}
                onChange={handleInputChange}
                placeholder="Auto-generated if empty"
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={errors.department ? 'error' : ''}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.department}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="position">Position *</label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className={errors.position ? 'error' : ''}
              >
                <option value="">Select Position</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
              {errors.position && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.position}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="rank">Rank</label>
              <select
                id="rank"
                name="rank"
                value={formData.rank}
                onChange={handleInputChange}
              >
                <option value="">Select Rank</option>
                {ranks.map(rank => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
            </div>

            {/* Contact Information */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="officer@police.gov"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1-555-0000"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.phone}
                </span>
              )}
            </div>

            {/* Service Information */}
            <div className="form-group">
              <label htmlFor="dateJoined">Date Joined</label>
              <input
                type="date"
                id="dateJoined"
                name="dateJoined"
                value={formData.dateJoined}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="yearsOfService">Years of Service</label>
              <input
                type="number"
                id="yearsOfService"
                name="yearsOfService"
                value={formData.yearsOfService}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                max="50"
              />
            </div>

            <div className="form-group">
              <label htmlFor="specialization">Specialization</label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                placeholder="e.g., K9 Unit, SWAT, Forensics"
              />
            </div>

            <div className="form-group">
              <label htmlFor="supervisor">Supervisor</label>
              <input
                type="text"
                id="supervisor"
                name="supervisor"
                value={formData.supervisor}
                onChange={handleInputChange}
                placeholder="Supervisor name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="shift">Shift</label>
              <select
                id="shift"
                name="shift"
                value={formData.shift}
                onChange={handleInputChange}
              >
                {shifts.map(shift => (
                  <option key={shift} value={shift}>{shift}</option>
                ))}
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
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="emergencyContact">Emergency Contact</label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                placeholder="Emergency contact information"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="submit-btn"
            >
              {isSubmitting ? 'Saving...' : (editingOfficer ? 'Update Officer' : 'Add Officer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOfficerModal;
