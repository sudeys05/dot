
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Badge,
  Building2,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Edit
} from 'lucide-react';
import './UserManagement.css';

const UserManagement = ({ onRegisterClick }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('🔍 Fetching users from API...');
      const response = await fetch('/api/users');
      const data = await response.json();

      console.log('📊 Users API response:', data);

      if (response.ok) {
        const usersArray = data.users || data || [];
        console.log('✅ Users set in state:', usersArray.length, 'users');
        setUsers(usersArray);
      } else {
        console.error('❌ Failed to fetch users:', data.message);
        setError(data.message || 'Failed to fetch users');
        setUsers([]);
      }
    } catch (err) {
      console.error('❌ Network error fetching users:', err);
      setError('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      try {
        console.log('🗑️ Deleting user:', userId, username);
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess(`User "${username}" deleted successfully`);
          setError('');
          setUsers(users.filter(user => (user._id || user.id) !== userId));
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(data.message || 'Failed to delete user');
          setSuccess('');
        }
      } catch (err) {
        console.error('❌ Error deleting user:', err);
        setError('Failed to delete user');
        setSuccess('');
      }
    }
  };

  const getUserId = (user) => user._id || user.id;
  const getUserDisplayName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getUserDisplayName(user).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getInitials = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  const getStatusColor = (isActive) => isActive ? '#10B981' : '#EF4444';
  const getRoleColor = (role) => role === 'admin' ? '#8B5CF6' : '#3B82F6';

  if (loading) {
    return (
      <div className="user-management-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <Users className="title-icon" />
            <div>
              <h1>User Management</h1>
              <p className="subtitle">Manage system users and permissions</p>
            </div>
          </div>
          <button className="primary-button" onClick={onRegisterClick}>
            <UserPlus size={20} />
            Add New User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{users.length}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <User size={24} />
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.isActive).length}</h3>
            <p>Active Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon admin">
            <Shield size={24} />
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.role === 'admin').length}</h3>
            <p>Administrators</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon officers">
            <Badge size={24} />
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.role === 'user').length}</h3>
            <p>Officers</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert error-alert">
          <div className="alert-content">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {success && (
        <div className="alert success-alert">
          <div className="alert-content">
            <strong>Success:</strong> {success}
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="controls-section">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filters-container">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="user">Officers</option>
            </select>
          </div>
          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="users-section">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Users size={64} />
            </div>
            <h3>No Users Found</h3>
            <p>
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'No users match your current filters.'
                : 'No users have been registered in the system yet.'}
            </p>
            {!searchTerm && roleFilter === 'all' && statusFilter === 'all' && (
              <button className="primary-button" onClick={onRegisterClick}>
                <UserPlus size={20} />
                Add First User
              </button>
            )}
          </div>
        ) : (
          <div className="users-grid">
            {filteredUsers.map((user) => (
              <div key={getUserId(user)} className="user-card">
                <div className="user-card-header">
                  <div className="user-avatar">
                    <span>{getInitials(user)}</span>
                    <div 
                      className="status-indicator"
                      style={{ backgroundColor: getStatusColor(user.isActive) }}
                    ></div>
                  </div>
                  <div className="user-info">
                    <h3 className="user-name">{getUserDisplayName(user)}</h3>
                    <p className="username">@{user.username}</p>
                    <div className="badges">
                      <span 
                        className="role-badge"
                        style={{ backgroundColor: getRoleColor(user.role) }}
                      >
                        {user.role === 'admin' ? (
                          <>
                            <Shield size={12} />
                            Administrator
                          </>
                        ) : (
                          <>
                            <Badge size={12} />
                            Officer
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  {user.username !== 'admin' && (
                    <div className="card-actions">
                      <button
                        className="action-button delete"
                        onClick={() => handleDeleteUser(getUserId(user), user.username)}
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="user-details">
                  {user.email && (
                    <div className="detail-row">
                      <Mail size={16} className="detail-icon" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  
                  {user.phone && (
                    <div className="detail-row">
                      <Phone size={16} className="detail-icon" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  
                  {user.department && (
                    <div className="detail-row">
                      <Building2 size={16} className="detail-icon" />
                      <span>{user.department}</span>
                    </div>
                  )}
                  
                  {user.position && (
                    <div className="detail-row">
                      <Badge size={16} className="detail-icon" />
                      <span>{user.position}</span>
                    </div>
                  )}
                  
                  {user.badgeNumber && (
                    <div className="detail-row">
                      <Shield size={16} className="detail-icon" />
                      <span>Badge: {user.badgeNumber}</span>
                    </div>
                  )}
                  
                  <div className="detail-row">
                    <Calendar size={16} className="detail-icon" />
                    <span>Joined {user.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
                  </div>
                </div>

                {user.username === currentUser?.username && (
                  <div className="current-user-indicator">
                    <span>Current User</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
