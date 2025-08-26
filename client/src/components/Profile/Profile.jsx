
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Edit2, Save, X, Mail, Phone, MapPin, Shield, Calendar } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    badgeNumber: '',
    department: '',
    position: '',
    address: '',
    emergencyContact: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Fetching user profile...');
      const response = await fetch('/api/profile');
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Received profile from API:', data);
        setProfile(data.user);
        
        // Set form data for editing
        setFormData({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          badgeNumber: data.user.badgeNumber || '',
          department: data.user.department || '',
          position: data.user.position || '',
          address: data.user.address || '',
          emergencyContact: data.user.emergencyContact || ''
        });
        
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Updating profile with data:', formData);
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile updated successfully:', data);
        setProfile(data.user);
        setIsEditing(false);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current profile values
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        badgeNumber: profile.badgeNumber || '',
        department: profile.department || '',
        position: profile.position || '',
        address: profile.address || '',
        emergencyContact: profile.emergencyContact || ''
      });
    }
    setIsEditing(false);
    setError('');
  };

  if (isLoading && !profile) {
    return (
      <div className="profile-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="profile-container">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={fetchProfile} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <User size={48} />
        </div>
        <div className="profile-title">
          <h1>My Profile</h1>
          <p>Manage your personal information and account settings</p>
        </div>
        <div className="profile-actions">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="edit-btn">
              <Edit2 size={18} />
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button onClick={handleCancel} className="cancel-btn">
                <X size={18} />
                Cancel
              </button>
              <button onClick={handleSave} className="save-btn" disabled={isLoading}>
                <Save size={18} />
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-section">
          <h2>Personal Information</h2>
          <div className="profile-fields">
            <div className="field-group">
              <label>First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                />
              ) : (
                <div className="field-value">
                  {profile?.firstName || 'Not provided'}
                </div>
              )}
            </div>

            <div className="field-group">
              <label>Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                />
              ) : (
                <div className="field-value">
                  {profile?.lastName || 'Not provided'}
                </div>
              )}
            </div>

            <div className="field-group">
              <label>
                <Mail size={16} />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              ) : (
                <div className="field-value">
                  {profile?.email || 'Not provided'}
                </div>
              )}
            </div>

            <div className="field-group">
              <label>
                <Phone size={16} />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              ) : (
                <div className="field-value">
                  {profile?.phone || 'Not provided'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Professional Information</h2>
          <div className="profile-fields">
            <div className="field-group">
              <label>
                <Shield size={16} />
                Badge Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="badgeNumber"
                  value={formData.badgeNumber}
                  onChange={handleInputChange}
                  placeholder="Enter badge number"
                />
              ) : (
                <div className="field-value">
                  {profile?.badgeNumber || 'Not provided'}
                </div>
              )}
            </div>

            <div className="field-group">
              <label>Department</label>
              {isEditing ? (
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                >
                  <option value="">Select Department</option>
                  <option value="Criminal Investigation">Criminal Investigation</option>
                  <option value="Traffic Police">Traffic Police</option>
                  <option value="Community Policing">Community Policing</option>
                  <option value="Cybercrime Unit">Cybercrime Unit</option>
                  <option value="Narcotics Division">Narcotics Division</option>
                  <option value="Forensics">Forensics</option>
                  <option value="K-9 Unit">K-9 Unit</option>
                  <option value="SWAT Team">SWAT Team</option>
                  <option value="Internal Affairs">Internal Affairs</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Patrol Division">Patrol Division</option>
                </select>
              ) : (
                <div className="field-value">
                  {profile?.department || 'Not provided'}
                </div>
              )}
            </div>

            <div className="field-group">
              <label>Position</label>
              {isEditing ? (
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                >
                  <option value="">Select Position</option>
                  <option value="Police Officer">Police Officer</option>
                  <option value="Sergeant">Sergeant</option>
                  <option value="Lieutenant">Lieutenant</option>
                  <option value="Captain">Captain</option>
                  <option value="Inspector">Inspector</option>
                  <option value="Detective">Detective</option>
                  <option value="Specialist">Specialist</option>
                  <option value="Chief Inspector">Chief Inspector</option>
                  <option value="Deputy Commissioner">Deputy Commissioner</option>
                  <option value="Commissioner">Commissioner</option>
                </select>
              ) : (
                <div className="field-value">
                  {profile?.position || 'Not provided'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Additional Information</h2>
          <div className="profile-fields">
            <div className="field-group full-width">
              <label>
                <MapPin size={16} />
                Address
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter address"
                  rows="3"
                />
              ) : (
                <div className="field-value">
                  {profile?.address || 'Not provided'}
                </div>
              )}
            </div>

            <div className="field-group full-width">
              <label>Emergency Contact</label>
              {isEditing ? (
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="Enter emergency contact information"
                />
              ) : (
                <div className="field-value">
                  {profile?.emergencyContact || 'Not provided'}
                </div>
              )}
            </div>
          </div>
        </div>

        {profile && (
          <div className="profile-section">
            <h2>Account Information</h2>
            <div className="profile-fields">
              <div className="field-group">
                <label>Username</label>
                <div className="field-value readonly">
                  {profile.username}
                </div>
              </div>

              <div className="field-group">
                <label>Role</label>
                <div className="field-value readonly">
                  <span className={`role-badge ${profile.role}`}>
                    {profile.role === 'admin' ? 'Administrator' : 'Officer'}
                  </span>
                </div>
              </div>

              <div className="field-group">
                <label>
                  <Calendar size={16} />
                  Account Created
                </label>
                <div className="field-value readonly">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Not available'}
                </div>
              </div>

              <div className="field-group">
                <label>Last Updated</label>
                <div className="field-value readonly">
                  {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'Not available'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
