import React, { useState } from 'react';
import { MapPin, Calendar, User, AlertCircle, Edit3, Save, X, Clock } from 'lucide-react';
import { updateSignal, getCollectors } from '../../firebase/firestore';

const SignalCard = ({ signal, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editData, setEditData] = useState({
    status: signal.status,
    priority: signal.priority,
    adminNotes: signal.adminNotes || '',
    assignedTo: signal.assignedTo || ''
  });
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (isEditing) {
      loadCollectors();
    }
  }, [isEditing]);

  const loadCollectors = async () => {
    try {
      const collectorsData = await getCollectors();
      setCollectors(collectorsData);
    } catch (err) {
      console.error('Error loading collectors:', err);
      setError('Failed to load collectors');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await updateSignal(signal.id, editData);
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating signal:', error);
      alert('Error updating signal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'normal':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString() + ' ' + timestamp.toDate().toLocaleTimeString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {signal.description}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {signal.location?.address || 'No address'}
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {signal.userEmail}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatDate(signal.createdAt)}
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(signal.status)}`}>
            {signal.status.replace('_', ' ').toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(signal.priority)}`}>
            {signal.priority.toUpperCase()}
          </span>
        </div>
      </div>

      {signal.imageUrl && (
        <div className="mb-4">
          <img
            src={signal.imageUrl}
            alt="Signal"
            className="w-full h-48 object-cover rounded-lg cursor-pointer"
            onClick={() => window.open(signal.imageUrl, '_blank')}
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-green-600 hover:text-green-800 text-sm font-medium"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Assigned To:</span>
              <p className="text-gray-600">{signal.assignedTo || 'Unassigned'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Report Source:</span>
              <p className="text-gray-600">{signal.reportSource}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Location Accuracy:</span>
              <p className="text-gray-600">{signal.location?.accuracy ? `${signal.location.accuracy}m` : 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Last Updated:</span>
              <p className="text-gray-600">{formatDate(signal.updatedAt)}</p>
            </div>
            {signal.adminNotes && (
              <div className="col-span-2">
                <span className="font-medium text-gray-700">Admin Notes:</span>
                <p className="text-gray-600">{signal.adminNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {isEditing && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={editData.status}
                onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={editData.priority}
                onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <select
                value={editData.assignedTo}
                onChange={(e) => setEditData(prev => ({ ...prev, assignedTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Unassigned</option>
                {collectors.map((collector) => (
                  <option key={collector.id} value={collector.email}>
                    {collector.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
              <textarea
                value={editData.adminNotes}
                onChange={(e) => setEditData(prev => ({ ...prev, adminNotes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Add notes about this signal..."
              />
            </div>
            <div className="col-span-2 flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignalCard;