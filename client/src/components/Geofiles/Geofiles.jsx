import React, { useState, useEffect } from 'react';
import { 
  Map, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  RotateCcw,
  FileText,
  Calendar,
  MapPin,
  Upload,
  Download,
  Link,
  Car,
  Radio,
  Trash2
} from 'lucide-react';
import InteractiveMap from './InteractiveMap';
import './Geofiles.css';

const Geofiles = () => {
  const [geofiles, setGeofiles] = useState([]);
  const [cases, setCases] = useState([]);
  const [obEntries, setObEntries] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [policeVehicles, setPoliceVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'detail', 'edit', 'map'
  const [selectedGeofile, setSelectedGeofile] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const fileTypes = ['SHP', 'KML', 'GeoJSON', 'CSV'];
  const accessLevels = ['internal', 'department', 'public'];
  const [tagFilter, setTagFilter] = useState('');
  const [accessLevelFilter, setAccessLevelFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch data from API
  const fetchGeofiles = async () => {
    try {
      console.log('🔍 Fetching geofiles from MongoDB API...');
      setIsLoading(true);

      // Build query parameters for filtering
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter) params.append('fileType', typeFilter);
      if (accessLevelFilter) params.append('accessLevel', accessLevelFilter);
      if (tagFilter) params.append('tags', tagFilter);
      if (dateFromFilter) params.append('dateFrom', dateFromFilter);
      if (dateToFilter) params.append('dateTo', dateToFilter);

      const queryString = params.toString();
      const url = `/api/geofiles${queryString ? `?${queryString}` : ''}`;

      console.log('📍 API URL:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Received geofiles from API:', data);

      setGeofiles(data.geofiles || []);
      console.log('✅ Geofiles set in state:', data.geofiles?.length || 0, 'records');
    } catch (error) {
      console.error('❌ Failed to fetch geofiles:', error);
      setError('Failed to fetch geofiles: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPoliceVehicles = async () => {
    try {
      const response = await fetch('/api/police-vehicles');
      if (response.ok) {
        const data = await response.json();
        // Add sample data if no vehicles exist
        const vehicles = data && data.length > 0 ? data : getSampleVehicleData();
        setPoliceVehicles(vehicles);
      } else {
        console.error('Failed to fetch police vehicles');
        // Use sample data as fallback
        setPoliceVehicles(getSampleVehicleData());
      }
    } catch (error) {
      console.error('Network error fetching police vehicles:', error);
      // Use sample data as fallback
      setPoliceVehicles(getSampleVehicleData());
    }
  };

  const getSampleVehicleData = () => [
    {
      id: 'demo1',
      vehicleId: 'PATROL-001',
      make: 'Ford',
      model: 'Explorer',
      year: 2023,
      licensePlate: 'POL-001',
      vehicleType: 'patrol',
      status: 'on_patrol',
      currentLocation: '[45.0792, -74.5058]', // Montreal coordinates
      assignedArea: '[[[45.070, -74.520], [45.080, -74.520], [45.080, -74.490], [45.070, -74.490], [45.070, -74.520]]]',
      assignedOfficerId: 'OFF-001',
      lastUpdate: new Date().toISOString()
    },
    {
      id: 'demo2',
      vehicleId: 'PATROL-002',
      make: 'Chevrolet',
      model: 'Tahoe',
      year: 2022,
      licensePlate: 'POL-002',
      vehicleType: 'special',
      status: 'available',
      currentLocation: '[45.0892, -74.4958]',
      assignedArea: '[[[45.080, -74.510], [45.090, -74.510], [45.090, -74.480], [45.080, -74.480], [45.080, -74.510]]]',
      assignedOfficerId: 'OFF-002',
      lastUpdate: new Date(Date.now() - 5 * 60000).toISOString() // 5 minutes ago
    },
    {
      id: 'demo3',
      vehicleId: 'MOTOR-001',
      make: 'Harley Davidson',
      model: 'Police Special',
      year: 2023,
      licensePlate: 'POL-M01',
      vehicleType: 'motorcycle',
      status: 'responding',
      currentLocation: '[45.0692, -74.5158]',
      assignedArea: '[[[45.060, -74.530], [45.070, -74.530], [45.070, -74.500], [45.060, -74.500], [45.060, -74.530]]]',
      assignedOfficerId: 'OFF-003',
      lastUpdate: new Date(Date.now() - 2 * 60000).toISOString() // 2 minutes ago
    },
    {
      id: 'demo4',
      vehicleId: 'K9-UNIT',
      make: 'Ford',
      model: 'F-150',
      year: 2023,
      licensePlate: 'POL-K9',
      vehicleType: 'k9',
      status: 'on_patrol',
      currentLocation: '[45.0992, -74.4858]',
      assignedArea: '[[[45.090, -74.500], [45.100, -74.500], [45.100, -74.470], [45.090, -74.470], [45.090, -74.500]]]',
      assignedOfficerId: 'OFF-004',
      lastUpdate: new Date(Date.now() - 1 * 60000).toISOString() // 1 minute ago
    },
    {
      id: 'demo5',
      vehicleId: 'PATROL-003',
      make: 'Ford',
      model: 'Crown Victoria',
      year: 2021,
      licensePlate: 'POL-003',
      vehicleType: 'patrol',
      status: 'out_of_service',
      currentLocation: '[45.0592, -74.5258]',
      assignedArea: '[[[45.050, -74.540], [45.060, -74.540], [45.060, -74.510], [45.050, -74.510], [45.050, -74.540]]]',
      assignedOfficerId: null,
      lastUpdate: new Date(Date.now() - 30 * 60000).toISOString() // 30 minutes ago
    }
  ];

  const fetchRelatedData = async () => {
    try {
      const [casesRes, obRes, evidenceRes, vehiclesRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/ob-entries'),
        fetch('/api/evidence'),
        fetch('/api/police-vehicles')
      ]);

      if (casesRes.ok) {
        const casesData = await casesRes.json();
        setCases(casesData.cases || []);
      }

      if (obRes.ok) {
        const obData = await obRes.json();
        setObEntries(obData.obEntries || []);
      }

      if (evidenceRes.ok) {
        const evidenceData = await evidenceRes.json();
        setEvidence(evidenceData.evidence || []);
      }

      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json();
        setPoliceVehicles(vehiclesData || []);
      }
    } catch (error) {
      console.error('Failed to fetch related data:', error);
    }
  };

  useEffect(() => {
    fetchGeofiles();
    fetchRelatedData();
  }, []);

  // Trigger fetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchGeofiles();
    }, 500); // Debounce the search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, typeFilter, accessLevelFilter, tagFilter, dateFromFilter, dateToFilter]);

  // No local filtering needed since we have server-side filtering
  const filteredGeofiles = geofiles;

  const navigateToView = (view, geofile = null) => {
    setCurrentView(view);
    setSelectedGeofile(geofile);
  };

  const goBack = () => {
    if (currentView === 'detail') {
      setCurrentView('list');
    } else if (currentView === 'edit') {
      setCurrentView('detail');
    } else if (currentView === 'map') {
      setCurrentView('list');
      setSelectedVehicle(null);
    } else {
      setCurrentView('list');
    }
    if (currentView === 'create') {
      setSelectedGeofile(null);
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleCreateGeofile = async (formData) => {
    try {
      console.log('🔍 Creating geofile with data:', formData);
      setIsLoading(true);

      const response = await fetch('/api/geofiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create geofile');
      }

      const data = await response.json();
      console.log('✅ Geofile created successfully:', data);

      await fetchGeofiles();
      setCurrentView('list');
      setError('');
    } catch (error) {
      console.error('❌ Failed to create geofile:', error);
      setError('Failed to create geofile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditGeofile = async (id, formData) => {
    try {
      console.log('🔍 Updating geofile:', id, 'with data:', formData);
      setIsLoading(true);

      const response = await fetch(`/api/geofiles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update geofile');
      }

      const data = await response.json();
      console.log('✅ Geofile updated successfully:', data);

      await fetchGeofiles();
      setCurrentView('list');
      setSelectedGeofile(null);
      setError('');
    } catch (error) {
      console.error('❌ Failed to update geofile:', error);
      setError('Failed to update geofile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGeofile = async (id) => {
    if (!window.confirm('Are you sure you want to delete this geofile?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting geofile:', id);
      setIsLoading(true);

      const response = await fetch(`/api/geofiles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete geofile');
      }

      console.log('✅ Geofile deleted successfully');
      await fetchGeofiles();
      setError('');
    } catch (error) {
      console.error('❌ Failed to delete geofile:', error);
      setError('Failed to delete geofile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadGeofile = async (geofile) => {
    try {
      console.log('📥 Recording download for geofile:', geofile.id);

      // Record the download in the database
      await fetch(`/api/geofiles/${geofile.id}/download`, {
        method: 'POST',
      });

      // Trigger the actual download if file URL exists
      if (geofile.fileUrl || geofile.filepath) {
        const downloadUrl = geofile.fileUrl || geofile.filepath;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = geofile.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Refresh the geofiles list to update download count
      await fetchGeofiles();
    } catch (error) {
      console.error('❌ Failed to download geofile:', error);
      setError('Failed to download geofile: ' + error.message);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'kml': return <Map size={16} className="file-kml" />;
      case 'gpx': return <MapPin size={16} className="file-gpx" />;
      case 'shp': return <FileText size={16} className="file-shp" />;
      case 'geojson': return <Map size={16} className="file-geojson" />;
      case 'kmz': return <Map size={16} className="file-kmz" />;
      case 'gml': return <FileText size={16} className="file-gml" />;
      default: return <FileText size={16} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1048576) + ' MB';
  };

  const getAccessLevelBadgeClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'public': return 'access-badge public';
      case 'department': return 'access-badge department';
      case 'internal': return 'access-badge internal';
      default: return 'access-badge';
    }
  };

  const formatTags = (tagsString) => {
    if (!tagsString) return [];
    try {
      return JSON.parse(tagsString);
    } catch {
      return [];
    }
  };

  const GeofilesList = () => (
    <div className="geofiles-list">
      <div className="geofiles-header">
        <div className="header-content">
          <Map className="header-icon" />
          <div>
            <h1>Geo Files Management</h1>
            <p>Manage geographic data and location files</p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-btn" 
            onClick={fetchGeofiles}
            disabled={isLoading}
            title="Refresh geofiles list"
          >
            <RotateCcw size={18} className={isLoading ? 'spinning' : ''} />
            Refresh
          </button>
          <button className="view-map-btn" onClick={() => navigateToView('map')}>
            <Radio size={18} />
            Vehicle Map
          </button>
          <button className="add-geofile-btn" onClick={() => navigateToView('create')}>
            <Plus size={18} />
            Add Geofile
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="primary-filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search geofiles by name, description, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All File Types</option>
              {fileTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select value={accessLevelFilter} onChange={(e) => setAccessLevelFilter(e.target.value)}>
              <option value="">All Access Levels</option>
              {accessLevels.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
            <button 
              className="advanced-filters-toggle"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
            </button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="advanced-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label>Tags:</label>
                <input
                  type="text"
                  placeholder="Search by tags (comma separated)"
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Date From:</label>
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Date To:</label>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                />
              </div>
              <div className="filter-actions">
                <button 
                  className="clear-filters-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setTypeFilter('');
                    setTagFilter('');
                    setAccessLevelFilter('');
                    setDateFromFilter('');
                    setDateToFilter('');
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="geofiles-grid">
        {isLoading ? (
          <div className="loading-state">Loading geofiles...</div>
        ) : filteredGeofiles.length === 0 ? (
          <div className="empty-state">
            <Map size={48} />
            <h3>No geofiles found</h3>
            <p>Add new geofiles or adjust your search filters</p>
          </div>
        ) : (
          filteredGeofiles.map((geofile) => (
            <div key={geofile.id} className="geofile-card">
              <div className="geofile-header" onClick={() => navigateToView('detail', geofile)}>
                <div className="geofile-info">
                  <h3>{geofile.filename}</h3>
                  <p className="geofile-description">{geofile.description || 'No description'}</p>
                  {geofile.locationName && (
                    <p className="location-name">📍 {geofile.locationName}</p>
                  )}
                </div>
                <div className="file-badges">
                  <div className="file-type">
                    {getFileIcon(geofile.fileType)}
                    <span>{geofile.fileType?.toUpperCase()}</span>
                  </div>
                  <div className={getAccessLevelBadgeClass(geofile.accessLevel)}>
                    {geofile.accessLevel}
                  </div>
                </div>
              </div>
              <div className="geofile-body" onClick={() => navigateToView('detail', geofile)}>
                <div className="location-info">
                  {geofile.address && (
                    <p className="address">
                      <MapPin size={14} />
                      {geofile.address}
                    </p>
                  )}
                </div>
                <div className="geofile-stats">
                  <div className="stat-item">
                    <span className="stat-label">Size:</span>
                    <span className="stat-value">{formatFileSize(geofile.fileSize)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Downloads:</span>
                    <span className="stat-value">{geofile.downloadCount || 0}</span>
                  </div>
                </div>
                {formatTags(geofile.tags).length > 0 && (
                  <div className="geofile-tags">
                    {formatTags(geofile.tags).slice(0, 3).map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                    {formatTags(geofile.tags).length > 3 && (
                      <span className="tag-more">+{formatTags(geofile.tags).length - 3}</span>
                    )}
                  </div>
                )}
                <div className="geofile-meta">
                  <p className="upload-date">
                    <Calendar size={14} />
                    Uploaded: {new Date(geofile.createdAt).toLocaleDateString()}
                  </p>
                  {(geofile.caseId || geofile.obId || geofile.evidenceId) && (
                    <p className="linked-items">
                      <Link size={14} />
                      <span>Linked to records</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="geofile-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToView('detail', geofile);
                      }}
                      title="View details"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      className="action-btn edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToView('edit', geofile);
                      }}
                      title="Edit geofile"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      className="action-btn download-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadGeofile(geofile);
                      }}
                      title="Download file"
                    >
                      <Download size={16} />
                      Download
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this geofile?')) {
                          handleDeleteGeofile(geofile.id);
                        }
                      }}
                      title="Delete geofile"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const CreateGeofileForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      tags: '',
      fileType: 'SHP',
      coordinateSystem: 'WGS84',
      accessLevel: 'internal',
      isPublic: false,
      caseId: '',
      obId: '',
      evidenceId: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [filePreview, setFilePreview] = useState(null);

    const allowedFileTypes = ['.shp', '.kml', '.geojson', '.csv'];
    const coordinateSystems = [
      { value: 'WGS84', label: 'WGS 84 (EPSG:4326) - Global GPS Standard' },
      { value: 'UTM', label: 'UTM - Universal Transverse Mercator' },
      { value: 'NAD83', label: 'NAD83 - North American Datum 1983' },
      { value: 'WGS84_UTM', label: 'WGS 84 / UTM - Projected Coordinate System' },
      { value: 'EPSG_3857', label: 'EPSG:3857 - Web Mercator (Google Maps)' }
    ];

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    };

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

      if (!allowedFileTypes.includes(fileExtension)) {
        setErrors({ file: `Invalid file type. Please upload ${allowedFileTypes.join(', ')} files only.` });
        return;
      }

      setSelectedFile(file);
      setFilePreview({
        name: file.name,
        size: file.size,
        type: fileExtension.replace('.', '').toUpperCase(),
        lastModified: new Date(file.lastModified).toLocaleDateString()
      });

      // Auto-fill form data based on file
      setFormData(prev => ({
        ...prev,
        name: prev.name || file.name.replace(/\.[^/.]+$/, ""),
        fileType: fileExtension.replace('.', '').toUpperCase()
      }));

      if (errors.file) {
        setErrors(prev => ({ ...prev, file: '' }));
      }
    };

    const validateForm = () => {
      const newErrors = {};
      if (!formData.name || !formData.name.trim()) {
        newErrors.name = 'Name/Label is required';
      }
      if (!selectedFile) {
        newErrors.file = 'Please upload a geofile';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        console.log('📤 Form submission data:', {
          name: formData.name,
          fileType: formData.fileType,
          selectedFile: selectedFile?.name,
          description: formData.description,
          coordinateSystem: formData.coordinateSystem
        });

        const formDataToSend = new FormData();
        
        // Ensure we have a file
        if (selectedFile) {
          formDataToSend.append('file', selectedFile);
        }
        
        // Ensure we have required fields
        const fileName = formData.name?.trim();
        if (!fileName) {
          setErrors({ name: 'Name/Label is required' });
          setIsSubmitting(false);
          return;
        }
        
        formDataToSend.append('filename', fileName);
        formDataToSend.append('description', formData.description || '');
        formDataToSend.append('tags', formData.tags || '');
        formDataToSend.append('fileType', formData.fileType || 'GEOJSON');
        formDataToSend.append('coordinateSystem', formData.coordinateSystem || 'WGS84');
        formDataToSend.append('accessLevel', formData.accessLevel || 'internal');
        formDataToSend.append('isPublic', (formData.isPublic || false).toString());
        
        if (formData.caseId && formData.caseId.trim()) {
          formDataToSend.append('caseId', formData.caseId.trim());
        }
        if (formData.obId && formData.obId.trim()) {
          formDataToSend.append('obId', formData.obId.trim());
        }
        if (formData.evidenceId && formData.evidenceId.trim()) {
          formDataToSend.append('evidenceId', formData.evidenceId.trim());
        }

        // Debug: Log FormData contents
        console.log('📤 FormData being sent:');
        for (let [key, value] of formDataToSend.entries()) {
          console.log(`  ${key}:`, value);
        }

        const response = await fetch('/api/geofiles/upload', {
          method: 'POST',
          body: formDataToSend
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Upload successful:', result);
          await fetchGeofiles();
          goBack();
        } else {
          const errorData = await response.json();
          console.error('❌ Upload failed:', errorData);
          setErrors({ submit: errorData.message || 'Failed to upload geofile' });
        }
      } catch (error) {
        console.error('❌ Network error during upload:', error);
        setErrors({ submit: 'Network error. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="geofile-form-container">
        <div className="form-header">
          <button className="back-btn" onClick={goBack}>
            <Map size={20} />
            Back to Geofiles
          </button>
          <h1>Add New Geofile</h1>
        </div>

        <form onSubmit={handleSubmit} className="geofile-creation-form">
          {/* File Upload Section */}
          <div className="file-upload-section">
            <h3>📁 File Upload</h3>
            <div className="file-upload-area">
              <input
                type="file"
                id="geofile"
                accept=".shp,.kml,.geojson,.csv"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="geofile" className="file-upload-label">
                <Upload size={32} />
                <div className="upload-text">
                  <strong>Click to upload geofile</strong>
                  <p>Supports .shp, .kml, .geojson, .csv with lat/lng</p>
                </div>
              </label>
              {errors.file && <span className="error-text">{errors.file}</span>}
            </div>

            {filePreview && (
              <div className="file-preview">
                <div className="preview-header">
                  <strong>📄 Selected File:</strong>
                </div>
                <div className="preview-details">
                  <div><strong>Name:</strong> {filePreview.name}</div>
                  <div><strong>Type:</strong> {filePreview.type}</div>
                  <div><strong>Size:</strong> {(filePreview.size / 1024).toFixed(2)} KB</div>
                  <div><strong>Modified:</strong> {filePreview.lastModified}</div>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    setSelectedFile(null);
                    setFilePreview(null);
                    document.getElementById('geofile').value = '';
                  }}
                  className="remove-file-btn"
                >
                  Remove File
                </button>
              </div>
            )}
          </div>

          <div className="form-grid">
            {/* Name/Label */}
            <div className="form-group">
              <label htmlFor="name">Name/Label *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Downtown Patrol Zone"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
              <small className="field-help">Enter a descriptive name for this geofile</small>
            </div>

            {/* Coordinate System */}
            <div className="form-group">
              <label htmlFor="coordinateSystem">Coordinate System *</label>
              <select
                id="coordinateSystem"
                name="coordinateSystem"
                value={formData.coordinateSystem}
                onChange={handleInputChange}
              >
                {coordinateSystems.map(system => (
                  <option key={system.value} value={system.value}>
                    {system.label}
                  </option>
                ))}
              </select>
              <small className="field-help">Select coordinate system to align with existing maps</small>
            </div>

            {/* Access Level */}
            <div className="form-group">
              <label htmlFor="accessLevel">Access Level *</label>
              <select
                id="accessLevel"
                name="accessLevel"
                value={formData.accessLevel}
                onChange={handleInputChange}
              >
                {accessLevels.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Public Access Checkbox */}
            <div className="form-group checkbox-group">
              <label htmlFor="isPublic" className="checkbox-label">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                />
                <span>Make file publicly accessible</span>
              </label>
            </div>

            {/* Linked Records */}
            <div className="form-group">
              <label htmlFor="caseId">Linked Case (Optional)</label>
              <select
                id="caseId"
                name="caseId"
                value={formData.caseId}
                onChange={handleInputChange}
              >
                <option value="">Select a case...</option>
                {cases.map(caseItem => (
                  <option key={caseItem.id} value={caseItem.id}>
                    {caseItem.caseNumber} - {caseItem.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="obId">Linked OB Entry (Optional)</label>
              <select
                id="obId"
                name="obId"
                value={formData.obId}
                onChange={handleInputChange}
              >
                <option value="">Select an OB entry...</option>
                {obEntries.map(ob => (
                  <option key={ob.id} value={ob.id}>
                    {ob.obNumber} - {ob.type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="evidenceId">Linked Evidence (Optional)</label>
              <select
                id="evidenceId"
                name="evidenceId"
                value={formData.evidenceId}
                onChange={handleInputChange}
              >
                <option value="">Select evidence...</option>
                {evidence.map(evidenceItem => (
                  <option key={evidenceItem.id} value={evidenceItem.id}>
                    {evidenceItem.evidenceNumber} - {evidenceItem.type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group full-width">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g., #patrol, #district, #hotspot"
            />
            <small className="field-help">Use hashtags to categorize this geofile (e.g., #patrol, #district, #hotspot)</small>
          </div>

          {/* Description */}
          <div className="form-group full-width">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe this geofile and its purpose..."
              rows="4"
            />
            <small className="field-help">Optional field to describe the geofile's purpose and contents</small>
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
              {isSubmitting ? 'Adding...' : 'Add Geofile'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const GeofileDetail = () => {
    const linkedCase = cases.find(c => c.id === selectedGeofile?.caseId);
    const linkedOB = obEntries.find(ob => ob.id === selectedGeofile?.obId);
    const linkedEvidence = evidence.find(e => e.id === selectedGeofile?.evidenceId);

    return (
      <div className="geofile-detail">
        <div className="detail-header">
          <button className="back-btn" onClick={goBack}>
            <Map size={20} />
            Back to Geofiles
          </button>
          <div className="detail-actions">
            <button onClick={() => handleDownloadGeofile(selectedGeofile)}>
              <Download size={16} />
              Download
            </button>
            <button onClick={() => navigateToView('edit', selectedGeofile)}>
              <Edit2 size={16} />
              Edit Geofile
            </button>
          </div>
        </div>

        <div className="geofile-info-panel">
          <div className="panel-header">
            <div className="geofile-display">
              <Map size={32} />
              <h1>{selectedGeofile?.filename}</h1>
              <div className="file-type-badge">
                {getFileIcon(selectedGeofile?.fileType)}
                {selectedGeofile?.fileType}
              </div>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-section">
              <h3>File Information</h3>
              <div className="info-grid">
                <div><strong>Filename:</strong> {selectedGeofile?.filename}</div>
                <div><strong>File Type:</strong> {selectedGeofile?.fileType}</div>
                <div><strong>File Path:</strong> {selectedGeofile?.filepath}</div>
                <div><strong>Address:</strong> {selectedGeofile?.address || 'Not provided'}</div>
                <div><strong>Uploaded:</strong> {new Date(selectedGeofile?.createdAt).toLocaleString()}</div>
                <div><strong>Updated:</strong> {new Date(selectedGeofile?.updatedAt).toLocaleString()}</div>
              </div>
            </div>

            {selectedGeofile?.description && (
              <div className="detail-section">
                <h3>Description</h3>
                <p className="geofile-description">{selectedGeofile.description}</p>
              </div>
            )}

            {selectedGeofile?.coordinates && (
              <div className="detail-section">
                <h3>Coordinates</h3>
                <pre className="coordinates-data">{selectedGeofile.coordinates}</pre>
              </div>
            )}

            <div className="detail-section">
              <h3>Linked Records</h3>
              <div className="linked-records">
                {linkedCase && (
                  <div className="linked-item">
                    <FileText size={16} />
                    <span>Case: {linkedCase.caseNumber} - {linkedCase.title}</span>
                  </div>
                )}
                {linkedOB && (
                  <div className="linked-item">
                    <FileText size={16} />
                    <span>OB: {linkedOB.obNumber} - {linkedOB.type}</span>
                  </div>
                )}
                {linkedEvidence && (
                  <div className="linked-item">
                    <FileText size={16} />
                    <span>Evidence: {linkedEvidence.evidenceNumber} - {linkedEvidence.type}</span>
                  </div>
                )}
                {!linkedCase && !linkedOB && !linkedEvidence && (
                  <p className="no-links">No linked records found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const VehicleMapView = () => (
    <div className="vehicle-map-view">
      <div className="map-header">
        <button className="back-btn" onClick={goBack}>
          <Map size={20} />
          Back to Geofiles
        </button>
        <h1>Police Vehicle Tracking Map</h1>
      </div>

      <div className="map-container">
        <InteractiveMap 
          vehicles={policeVehicles}
          showPatrolAreas={true}
          onVehicleSelect={handleVehicleSelect}
        />
      </div>

      {selectedVehicle && (
        <div className="selected-vehicle-info">
          <h3>Selected Vehicle: {selectedVehicle.vehicleId}</h3>
          <p>{selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})</p>
          <p>Status: {selectedVehicle.status.replace('_', ' ')}</p>
          <p>License: {selectedVehicle.licensePlate}</p>
        </div>
      )}
    </div>
  );

  switch (currentView) {
    case 'detail':
      return <GeofileDetail />;
    case 'create':
      return <CreateGeofileForm />;
    case 'map':
      return <VehicleMapView />;
    default:
      return <GeofilesList />;
  }
};

export default Geofiles;