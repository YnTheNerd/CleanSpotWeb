import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { subscribeToSignals } from '../../firebase/firestore';
import { Filter, MapPin, Calendar, User, AlertCircle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different statuses
const createCustomIcon = (status) => {
  const colors = {
    pending: '#f59e0b',
    in_progress: '#3b82f6',
    resolved: '#10b981'
  };
  
  return L.divIcon({
    html: `<div style="background-color: ${colors[status] || '#6b7280'}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    className: 'custom-marker'
  });
};

const HeatmapControls = ({ filters, onFilterChange }) => {
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-xs">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <Filter className="h-5 w-5 mr-2" />
        Map Filters
      </h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            Pending
          </div>
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            In Progress
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            Resolved
          </div>
        </div>
      </div>
    </div>
  );
};

const Heatmap = () => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    startDate: '',
    endDate: ''
  });

  // Default center for Yaoundé, Cameroon
  const defaultCenter = [3.848, 11.502];

  useEffect(() => {
    const filterObj = {};
    if (filters.status) filterObj.status = filters.status;
    if (filters.priority) filterObj.priority = filters.priority;
    if (filters.startDate) filterObj.startDate = new Date(filters.startDate);
    if (filters.endDate) filterObj.endDate = new Date(filters.endDate);

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToSignals((snapshot) => {
      try {
        const signalsData = [];
        snapshot.forEach((doc) => {
          const signal = { id: doc.id, ...doc.data() };
          if (signal.location && signal.location.latitude && signal.location.longitude) {
            signalsData.push(signal);
          }
        });
        setSignals(signalsData);
        setLoading(false);
      } catch (err) {
        console.error('Error processing signals:', err);
        setError('Failed to load signals');
        setLoading(false);
      }
    }, filterObj);

    return () => unsubscribe();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'normal': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
      resolved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Resolved' }
    };
    
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 w-full">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {signals.map((signal) => (
          <Marker
            key={signal.id}
            position={[signal.location.latitude, signal.location.longitude]}
            icon={createCustomIcon(signal.status)}
          >
            <Popup className="custom-popup" maxWidth={300}>
              <div className="p-2">
                <div className="flex justify-between items-start mb-2">
                  {getStatusBadge(signal.status)}
                  <span className={`text-sm font-medium ${getPriorityColor(signal.priority)}`}>
                    {signal.priority?.toUpperCase() || 'NORMAL'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-800 mb-2 line-clamp-3">
                  {signal.description}
                </p>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">{signal.location.address || 'Address not available'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    <span className="truncate">{signal.userDisplayName || signal.userEmail}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(signal.createdAt)}</span>
                  </div>
                  
                  {signal.assignedTo && (
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      <span className="truncate">Assigned to: {signal.assignedTo}</span>
                    </div>
                  )}
                </div>
                
                {signal.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={signal.imageUrl}
                      alt="Signal"
                      className="w-full h-24 object-cover rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <HeatmapControls filters={filters} onFilterChange={handleFilterChange} />
      
      {/* Signal count indicator */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg px-3 py-2">
        <div className="flex items-center text-sm">
          <MapPin className="h-4 w-4 mr-1 text-green-600" />
          <span className="font-medium">{signals.length}</span>
          <span className="text-gray-600 ml-1">signals</span>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;