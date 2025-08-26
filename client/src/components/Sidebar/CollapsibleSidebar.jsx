import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  UserCheck, 
  Car, 
  Camera, 
  Map, 
  FileCheck, 
  User, 
  Users, 
  Badge,
  Shield,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './CollapsibleSidebar.css';

const CollapsibleSidebar = ({ activeSection, setActiveSection }) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'occurrence-book', label: 'Occurrence Book (OB)', icon: UserCheck },
    { id: 'custodial-records', label: 'Custodial Records', icon: Users },
    { id: 'license-plates', label: 'License Plates', icon: Car },
    { id: 'evidence', label: 'Evidence Log', icon: Camera },
    { id: 'geofiles', label: 'Geo Files', icon: Map },
    { id: 'reports', label: 'Generate Report', icon: FileCheck }
  ];

  // Add Officers navigation
  menuItems.push({ id: 'officers', label: 'Officers', icon: Badge });

  // Add admin-only items
  if (user?.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'User Management', icon: Users });
  }

  // Filter menu items based on admin access for profile
  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`collapsible-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="sidebar-header">
        <div className="logo">
          <Shield className="logo-icon" />
          {!isCollapsed && <span>Police Portal</span>}
        </div>
      </div>

      <button className="toggle-btn full-width" onClick={toggleSidebar} data-testid="button-toggle">
        {isCollapsed ? <MoreHorizontal size={18} /> : <ChevronLeft size={18} />}
        {!isCollapsed && <span>Collapse</span>}
      </button>

      {user && !isCollapsed && (
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

      {user && isCollapsed && (
        <div className="sidebar-user collapsed">
          <div className="user-avatar">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        {filteredMenuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
              onClick={() => setActiveSection(item.id)}
              title={isCollapsed ? item.label : ''}
            >
              <IconComponent className="nav-icon" />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button 
          className={`nav-item logout-item ${isCollapsed ? 'collapsed' : ''}`} 
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut className="nav-icon" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default CollapsibleSidebar;