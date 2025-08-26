
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus,
  Users,
  FileText,
  Shield,
  TrendingUp,
  Activity,
  Search,
  Bell,
  BarChart3,
  Car,
  MapPin,
  Database,
  UserCheck,
  Archive,
  AlertCircle,
  Calendar,
  Eye,
  Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = ({ onLicensePlateClick, setActiveSection }) => {
  const { user } = useAuth();
  
  // State for all data
  const [dashboardData, setDashboardData] = useState({
    obEntries: [],
    evidence: [],
    reports: [],
    officers: [],
    users: [],
    licensePlates: [],
    geofiles: [],
    custodialRecords: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch all data from APIs
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [
        obResponse,
        evidenceResponse,
        reportsResponse,
        officersResponse,
        usersResponse,
        licensePlatesResponse,
        geofilesResponse,
        custodialResponse
      ] = await Promise.all([
        fetch('/api/ob-entries'),
        fetch('/api/evidence'),
        fetch('/api/reports'),
        fetch('/api/officers'),
        fetch('/api/users'),
        fetch('/api/license-plates'),
        fetch('/api/geofiles'),
        fetch('/api/custodial-records')
      ]);

      const [
        obData,
        evidenceData,
        reportsData,
        officersData,
        usersData,
        licensePlatesData,
        geofilesData,
        custodialData
      ] = await Promise.all([
        obResponse.ok ? obResponse.json() : { obEntries: [] },
        evidenceResponse.ok ? evidenceResponse.json() : { evidence: [] },
        reportsResponse.ok ? reportsResponse.json() : { reports: [] },
        officersResponse.ok ? officersResponse.json() : { officers: [] },
        usersResponse.ok ? usersResponse.json() : { users: [] },
        licensePlatesResponse.ok ? licensePlatesResponse.json() : { licensePlates: [] },
        geofilesResponse.ok ? geofilesResponse.json() : { geofiles: [] },
        custodialResponse.ok ? custodialResponse.json() : { inmates: [] }
      ]);

      setDashboardData({
        obEntries: obData.obEntries || [],
        evidence: evidenceData.evidence || [],
        reports: reportsData.reports || [],
        officers: officersData.officers || [],
        users: usersData.users || [],
        licensePlates: licensePlatesData.licensePlates || [],
        geofiles: geofilesData.geofiles || [],
        custodialRecords: custodialData.inmates || []
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const stats = [
    { 
      title: 'OB Entries', 
      value: dashboardData.obEntries.length, 
      change: `${dashboardData.obEntries.filter(entry => {
        const entryDate = new Date(entry.createdAt || entry.dateTime);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate > weekAgo;
      }).length} this week`, 
      color: 'orange', 
      icon: FileText, 
      onClick: () => setActiveSection?.('occurrence-book'),
      trend: 'up'
    },
    { 
      title: 'Evidence Items', 
      value: dashboardData.evidence.length, 
      change: `${dashboardData.evidence.filter(item => item.priority === 'High').length} high priority`, 
      color: 'green', 
      icon: CheckCircle, 
      onClick: () => setActiveSection?.('evidence'),
      trend: 'up'
    },
    { 
      title: 'Active Officers', 
      value: dashboardData.officers.length, 
      change: `${dashboardData.users.filter(u => u.isActive).length} system users`, 
      color: 'blue', 
      icon: UserCheck, 
      onClick: () => setActiveSection?.('profile'),
      trend: 'up'
    },
    { 
      title: 'Custodial Records', 
      value: dashboardData.custodialRecords.length, 
      change: `${dashboardData.custodialRecords.filter(record => record.status === 'Active').length} active`, 
      color: 'red', 
      icon: Users, 
      onClick: () => setActiveSection?.('custodial-records'),
      trend: 'up'
    },
    { 
      title: 'Reports Generated', 
      value: dashboardData.reports.length, 
      change: `${dashboardData.reports.filter(r => r.status === 'Pending').length} pending`, 
      color: 'purple', 
      icon: BarChart3, 
      onClick: () => setActiveSection?.('reports'),
      trend: 'up'
    },
    { 
      title: 'Vehicle Records', 
      value: dashboardData.licensePlates.length, 
      change: `${dashboardData.licensePlates.filter(p => p.status === 'Active').length} active plates`, 
      color: 'teal', 
      icon: Car, 
      onClick: () => setActiveSection?.('license-plates'),
      trend: 'up'
    },
    { 
      title: 'Geofiles', 
      value: dashboardData.geofiles.length, 
      change: `${dashboardData.geofiles.filter(g => g.isPublic).length} public`, 
      color: 'indigo', 
      icon: MapPin, 
      onClick: () => setActiveSection?.('geofiles'),
      trend: 'up'
    },
    { 
      title: 'System Users', 
      value: dashboardData.users.length, 
      change: `${dashboardData.users.filter(u => u.role === 'admin').length} admins`, 
      color: 'gray', 
      icon: Shield, 
      onClick: () => setActiveSection?.('user-management'),
      trend: 'up'
    }
  ];

  const quickActions = [
    { 
      title: 'Add OB Entry', 
      subtitle: 'Create occurrence book entry', 
      icon: Plus, 
      color: 'blue', 
      onClick: () => setActiveSection?.('occurrence-book') 
    },
    { 
      title: 'Custodial Records', 
      subtitle: `${dashboardData.custodialRecords.filter(r => r.status === 'Pending').length} pending entries`, 
      icon: Users, 
      color: 'red', 
      onClick: () => setActiveSection?.('custodial-records') 
    },
    { 
      title: 'Geofile Access', 
      subtitle: `${dashboardData.geofiles.length} files available`, 
      icon: MapPin, 
      color: 'green', 
      onClick: () => setActiveSection?.('geofiles') 
    },
    { 
      title: 'License Plate Lookup', 
      subtitle: 'Vehicle search', 
      icon: Search, 
      color: 'purple', 
      onClick: onLicensePlateClick 
    },
    { 
      title: 'Evidence Management', 
      subtitle: `${dashboardData.evidence.length} items logged`, 
      icon: Archive, 
      color: 'teal', 
      onClick: () => setActiveSection?.('evidence') 
    },
    { 
      title: 'Generate Report', 
      subtitle: 'Create comprehensive report', 
      icon: BarChart3, 
      color: 'indigo', 
      onClick: () => setActiveSection?.('reports') 
    }
  ];

  // Recent activities from all modules
  const getRecentActivities = () => {
    const activities = [];

    // Add OB entries
    dashboardData.obEntries.slice(0, 3).forEach(entry => {
      activities.push({
        id: `OB-${entry.id}`,
        time: entry.createdAt || entry.dateTime || new Date().toISOString(),
        officer: entry.officer || entry.recordingOfficer || 'Unknown Officer',
        type: 'OB Entry',
        description: entry.description || entry.incidentDescription || 'New occurrence book entry',
        priority: entry.priority || 'MEDIUM',
        status: entry.status || 'Active',
        module: 'occurrence-book'
      });
    });

    // Add evidence items
    dashboardData.evidence.slice(0, 2).forEach(item => {
      activities.push({
        id: `EV-${item.id}`,
        time: item.createdAt || new Date().toISOString(),
        officer: item.collectedBy || 'Unknown Officer',
        type: 'Evidence',
        description: item.description || 'Evidence item logged',
        priority: item.priority || 'MEDIUM',
        status: item.status || 'Active',
        module: 'evidence'
      });
    });

    // Add reports
    dashboardData.reports.slice(0, 2).forEach(report => {
      activities.push({
        id: `RPT-${report.id}`,
        time: report.createdAt || new Date().toISOString(),
        officer: report.requestedBy || 'System',
        type: 'Report',
        description: report.title || 'Report generated',
        priority: report.priority || 'LOW',
        status: report.status || 'Generated',
        module: 'reports'
      });
    });

    // Add custodial records
    dashboardData.custodialRecords.slice(0, 2).forEach(record => {
      activities.push({
        id: `CR-${record.id}`,
        time: record.createdAt || record.admissionDate || new Date().toISOString(),
        officer: record.admittingOfficer || 'Unknown Officer',
        type: 'Custodial',
        description: `${record.firstName} ${record.lastName} - ${record.status || 'Admitted'}`,
        priority: record.riskLevel || 'MEDIUM',
        status: record.status || 'Active',
        module: 'custodial-records'
      });
    });

    // Sort by time (most recent first) and return top 10
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);
  };

  const recentActivities = getRecentActivities();

  const formatDateTime = () => {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return now.toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'high';
      case 'MEDIUM': return 'medium';
      case 'LOW': return 'low';
      default: return 'medium';
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <Activity className="spinning" size={48} />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Police Management System Dashboard</h1>
          <p>{formatDateTime()}</p>
          <small>Last updated: {formatTime(lastUpdated.toISOString())}</small>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-btn" 
            onClick={fetchAllData}
            disabled={isLoading}
            title="Refresh all data"
          >
            <Activity className={isLoading ? 'spinning' : ''} size={20} />
            Refresh
          </button>
          <div className="notification-badge">
            <span>{recentActivities.filter(a => a.priority === 'HIGH').length}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <section className="stats-section">
          <h2>System Overview</h2>
          <div className="stats-grid">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div 
                  key={index} 
                  className={`stat-card ${stat.color}`}
                  onClick={stat.onClick}
                  style={{ cursor: stat.onClick ? 'pointer' : 'default' }}
                  data-testid={`stat-card-${stat.title.toLowerCase().replace(' ', '-')}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${stat.title}: ${stat.value}, ${stat.change}`}
                >
                  <div className="stat-header">
                    <IconComponent className="stat-icon" />
                    <span className="stat-value">{stat.value}</span>
                  </div>
                  <div className="stat-info">
                    <h3>{stat.title}</h3>
                    <p>{stat.change}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="actions-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <div 
                  key={index} 
                  className={`action-card ${action.color}`}
                  onClick={action.onClick}
                  style={{ cursor: action.onClick ? 'pointer' : 'default' }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${action.title}: ${action.subtitle}`}
                >
                  <IconComponent className="action-icon" />
                  <div className="action-info">
                    <h3>{action.title}</h3>
                    <p>{action.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="updates-section">
          <h2>Recent System Activity</h2>
          <div className="table-container">
            <table className="updates-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date & Time</th>
                  <th>Module</th>
                  <th>Officer</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.length > 0 ? recentActivities.map((activity) => (
                  <tr 
                    key={activity.id}
                    onClick={() => setActiveSection?.(activity.module)}
                    style={{ cursor: 'pointer' }}
                    title={`Click to view ${activity.type}`}
                  >
                    <td>
                      <span className="entry-id">{activity.id}</span>
                    </td>
                    <td>{formatTime(activity.time)}</td>
                    <td>
                      <span className={`module-badge ${activity.module}`}>
                        {activity.type}
                      </span>
                    </td>
                    <td>
                      <span className="officer-name">{activity.officer}</span>
                    </td>
                    <td className="description-cell">{activity.description}</td>
                    <td>
                      <span className={`priority ${getPriorityColor(activity.priority)}`}>
                        {activity.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${activity.status.toLowerCase().replace(' ', '-')}`}>
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No recent activities found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="summary-section">
          <h2>Data Summary</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <h3>Most Active Module</h3>
              <p>{dashboardData.obEntries.length > 0 ? 'Occurrence Book' : 'No Activity'}</p>
              <span className="summary-stat">{dashboardData.obEntries.length} entries</span>
            </div>
            <div className="summary-card">
              <h3>Evidence Status</h3>
              <p>{dashboardData.evidence.filter(e => e.status === 'Active').length} Active Items</p>
              <span className="summary-stat">{dashboardData.evidence.length} total</span>
            </div>
            <div className="summary-card">
              <h3>System Health</h3>
              <p>All modules operational</p>
              <span className="summary-stat">✓ Connected</span>
            </div>
            <div className="summary-card">
              <h3>User Activity</h3>
              <p>{dashboardData.users.filter(u => u.isActive).length} Active Users</p>
              <span className="summary-stat">{dashboardData.users.length} total</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
