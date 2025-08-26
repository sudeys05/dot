import React from 'react';
import { 
  Home, 
  UserCheck, 
  User, 
  MessageSquare, 
  Camera, 
  Upload, 
  Edit3,
  LogOut,
  Shield,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ activeSection, setActiveSection }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'occurrence-book', label: 'Occurrence Book (OB)', icon: UserCheck },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'message', label: 'Message', icon: MessageSquare },
    { id: 'evidence', label: 'Evidence', icon: Camera },
    { id: 'media', label: 'Media', icon: Upload },
    { id: 'updates', label: 'Updates', icon: Edit3 }
  ];

  // Add admin-only items
  if (user?.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'User Management', icon: Users });
  }

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <Shield className="logo-icon" />
          <span>Police Portal</span>
        </div>
      </div>

      {user && (
        <div className="sidebar-user">
          <div className="user-avatar">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div className="user-info">
            <div className="user-name">{user.firstName} {user.lastName}</div>
            <div className="user-role">{user.role === 'admin' ? 'Administrator' : 'Officer'}</div>
            <div className="user-badge">Badge: {user.badgeNumber || 'N/A'}</div>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <IconComponent className="nav-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout-item" onClick={handleLogout}>
          <LogOut className="nav-icon" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;