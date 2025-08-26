import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import CollapsibleSidebar from './components/Sidebar/CollapsibleSidebar';
import EnhancedProfile from './components/Profile/EnhancedProfile';
import Dashboard from './components/Dashboard/Dashboard';
import OccurrenceBook from './components/OccurrenceBook/OccurrenceBook';
import LicensePlates from './components/LicensePlates/LicensePlates';
import Evidence from './components/Evidence/Evidence';
import Geofiles from './components/Geofiles/Geofiles';
import Reports from './components/Reports/Reports';
import UserManagement from './components/UserManagement/UserManagement';
import CustodialRecords from './components/CustodialRecords/CustodialRecords';

import LicensePlateModal from './components/LicensePlateModal/LicensePlateModal';
import LoginModal from './components/Auth/LoginModal';
import RegisterModal from './components/Auth/RegisterModal';
import ForgotPasswordModal from './components/Auth/ForgotPasswordModal';
import './App.css';

// Placeholder for Officers component if it's not imported yet
const Officers = () => <div>Officers Section</div>;


const AuthenticatedApp = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  const [isLicensePlateModalOpen, setIsLicensePlateModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

  const [showMessage, setShowMessage] = useState(null); // State for displaying messages

  const [licensePlates, setLicensePlates] = useState([
    {
      id: 'LP-1',
      plateNumber: 'ABC123',
      ownerName: 'John Smith',
      fatherName: 'Robert Smith',
      motherName: 'Mary Smith',
      idNumber: 'ID123456789',
      passportNumber: 'P987654321',
      ownerImage: null,
      dateAdded: '2025-01-15'
    }
  ]);

  // Initial state for OB entries, will be fetched from the API
  const [obEntries, setOBEntries] = useState([]);

  // Fetch OB entries when the component mounts
  useEffect(() => {
    fetchOBEntries();
  }, []);

  const fetchOBEntries = async () => {
    try {
      console.log('🔍 Fetching OB entries from MongoDB...');
      const response = await fetch('/api/ob-entries');
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Received OB entries from API:', data);
        setOBEntries(data.obEntries || []);
        console.log('✅ OB entries set in state:', data.obEntries?.length || 0, 'entries');
      } else {
        console.error('❌ Failed to fetch OB entries:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error fetching OB entries:', error);
    }
  };

  // Case handlers removed

  const handleAddOB = async (obData) => {
    try {
      console.log('🔍 Creating new OB entry:', obData);
      const response = await fetch('/api/ob-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(obData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ OB entry created successfully:', result);

        // Refresh the OB entries list from the database
        await fetchOBEntries();

        setShowMessage({ type: 'success', text: 'OB entry added successfully!' });
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to create OB entry:', errorData);
        setShowMessage({ type: 'error', text: 'Failed to add OB entry' });
      }
    } catch (error) {
      console.error('❌ Error adding OB entry:', error);
      setShowMessage({ type: 'error', text: 'Error adding OB entry' });
    }

    setTimeout(() => setShowMessage(null), 3000);
  };

  const handleUpdateOB = async (updatedOB) => {
    try {
      console.log('🔄 Updating OB entry:', updatedOB.id, updatedOB);
      const response = await fetch(`/api/ob-entries/${updatedOB.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedOB),
      });

      if (response.ok) {
        console.log('✅ OB entry updated successfully');

        // Refresh the OB entries list from the database
        await fetchOBEntries();

        setShowMessage({ type: 'success', text: 'OB entry updated successfully!' });
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to update OB entry:', errorData);
        setShowMessage({ type: 'error', text: 'Failed to update OB entry' });
      }
    } catch (error) {
      console.error('❌ Error updating OB entry:', error);
      setShowMessage({ type: 'error', text: 'Error updating OB entry' });
    }

    setTimeout(() => setShowMessage(null), 3000);
  };

  const handleDeleteOB = async (obId) => {
    try {
      console.log('🗑️ Deleting OB entry:', obId);
      const response = await fetch(`/api/ob-entries/${obId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('✅ OB entry deleted successfully');

        // Refresh the OB entries list from the database
        await fetchOBEntries();

        setShowMessage({ type: 'success', text: 'OB entry deleted successfully!' });
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to delete OB entry:', errorData);
        setShowMessage({ type: 'error', text: 'Failed to delete OB entry' });
      }
    } catch (error) {
      console.error('❌ Error deleting OB entry:', error);
      setShowMessage({ type: 'error', text: 'Error deleting OB entry' });
    }

    setTimeout(() => setShowMessage(null), 3000);
  };

  const handleAddPlate = (newPlate) => {
    setLicensePlates(prev => [newPlate, ...prev]);
  };

  const handleLicensePlateClick = () => {
    setIsLicensePlateModalOpen(true);
  };

  const handleSwitchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const handleSwitchToForgotPassword = () => {
    setIsLoginModalOpen(false);
    setIsForgotPasswordModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsForgotPasswordModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleRegisterClick = () => {
    setIsRegisterModalOpen(true);
  };

  // Updated renderContent to include 'profiles-list' and 'officers'
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onLicensePlateClick={handleLicensePlateClick} setActiveSection={setActiveSection} />;
      case 'occurrence-book':
        return <OccurrenceBook obEntries={obEntries} onUpdateOB={handleUpdateOB} onDeleteOB={handleDeleteOB} />;
      case 'license-plates':
        return <LicensePlates />;
      case 'evidence':
        return <Evidence />;
      case 'geofiles':
        return <Geofiles />;
      case 'reports':
        return <Reports />;
      case 'custodial-records':
        return <CustodialRecords />;
      case 'officers':
        return <EnhancedProfile />; // Assuming EnhancedProfile is the correct component for 'officers'
      case 'admin':
        return user?.role === 'admin' ? <UserManagement onRegisterClick={handleRegisterClick} /> : (
          <div style={{ padding: '30px', color: '#ffffff' }}>
            <h1>Access Denied</h1>
            <p>You don't have permission to access this section.</p>
          </div>
        );
      default:
        return <Dashboard onLicensePlateClick={handleLicensePlateClick} setActiveSection={setActiveSection} />;
    }
  };

  // Show loading screen
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading Police System...</h2>
          <p>Authenticating user session</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="login-screen">
        <div className="login-content">
          <div className="login-header">
            <div className="login-logo">
              <div className="logo-badge">🛡️</div>
              <h1>Police Management System</h1>
              <p>Secure Access Portal</p>
            </div>
          </div>

          <div className="login-form">
            <button
              className="login-btn"
              onClick={() => setIsLoginModalOpen(true)}
            >
              Sign In to Continue
            </button>
            <p className="login-help">
              Use your assigned username and password to access the system.
            </p>
            <p className="default-credentials">
              <strong>Default Admin:</strong> admin / admin123
            </p>
          </div>
        </div>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSwitchToRegister={handleSwitchToRegister}
          onSwitchToForgotPassword={handleSwitchToForgotPassword}
        />

        <ForgotPasswordModal
          isOpen={isForgotPasswordModalOpen}
          onClose={() => setIsForgotPasswordModalOpen(false)}
          onSwitchToLogin={handleSwitchToLogin}
        />
      </div>
    );
  }

  // Main authenticated app
  return (
    <div className="app">
      <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="main-content">
        {renderContent()}
      </div>

      <LicensePlateModal
        isOpen={isLicensePlateModalOpen}
        onClose={() => setIsLicensePlateModalOpen(false)}
        onAddPlate={handleAddPlate}
        onSearchPlate={() => {}}
        plates={licensePlates}
      />

      {user?.role === 'admin' && (
        <RegisterModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
      {showMessage && (
        <div className={`message-toast ${showMessage.type}`}>
          {showMessage.text}
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;