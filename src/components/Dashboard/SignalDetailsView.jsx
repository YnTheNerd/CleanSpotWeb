import React, { useState } from 'react';
import { MapPin, Calendar, User, AlertCircle, Edit3, Save, X, Clock, Image as ImageIcon, ExternalLink, Phone, Mail } from 'lucide-react';
import { updateSignal, getCollectors } from '../../firebase/firestore';

const SignalDetailsView = ({ signals, onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 border-red-600';
      case 'normal':
        return 'bg-yellow-500 border-yellow-600';
      case 'low':
        return 'bg-green-500 border-green-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = async (signal) => {
    setEditingId(signal.id);
    setEditData({
      status: signal.status,
      priority: signal.priority,
      adminNotes: signal.adminNotes || '',
      assignedTo: signal.assignedTo || ''
    });

    try {
      const collectorsData = await getCollectors();
      setCollectors(collectorsData);
    } catch (err) {
      console.error('Error loading collectors:', err);
    }
  };

  const handleSave = async (signalId) => {
    setLoading(true);
    try {
      await updateSignal(signalId, editData);
      setEditingId(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating signal:', error);
      alert('Error updating signal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  if (signals.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No signals found</h3>
        <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {signals.map((signal) => {
        const isEditing = editingId === signal.id;
        const assignedCollector = collectors.find(c => c.id === signal.assignedTo);
        
        return (
          <div
            key={signal.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
          >
            {/* Priority Indicator */}
            <div className={`h-2 ${getPriorityColor(signal.priority)}`}></div>
            
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {signal.description}
                  </h2>
                  
                  {/* Status and Priority Badges */}
                  <div className="flex items-center space-x-3 mb-4">
                    {isEditing ? (
                      <>
                        <select
                          value={editData.status}
                          onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <select
                          value={editData.priority}
                          onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="low">Low Priority</option>
                          <option value="normal">Normal Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </>
                    ) : (
                      <>
                        <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full border ${getStatusColor(signal.status)}`}>
                          {signal.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full text-white ${getPriorityColor(signal.priority)}`}>
                          {signal.priority.toUpperCase()} PRIORITY
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-3 ml-6">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSave(signal.id)}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(signal)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Signal
                    </button>
                  )}
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Signal Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Reporter Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Reporter Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-5 w-5 mr-3 text-gray-400" />
                        <span className="text-gray-900">{signal.userEmail}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-3 text-gray-400" />
                        <span className="text-gray-600">{formatDate(signal.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-900">{signal.location?.address || 'No address provided'}</p>
                          {signal.location?.coordinates && (
                            <p className="text-sm text-gray-600 mt-1">
                              Coordinates: {signal.location.coordinates.latitude}, {signal.location.coordinates.longitude}
                            </p>
                          )}
                        </div>
                      </div>
                      {signal.location?.coordinates && (
                        <a
                          href={`https://www.google.com/maps?q=${signal.location.coordinates.latitude},${signal.location.coordinates.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View on Google Maps
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Image */}
                  {signal.imageUrl && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Signal Image</h3>
                      <img
                        src={signal.imageUrl}
                        alt="Signal"
                        className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>

                {/* Right Column - Management */}
                <div className="space-y-6">
                  {/* Admin Notes */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h3>
                    {isEditing ? (
                      <textarea
                        value={editData.adminNotes}
                        onChange={(e) => setEditData({ ...editData, adminNotes: e.target.value })}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="Add admin notes..."
                      />
                    ) : (
                      <div className="bg-white p-4 rounded-md border border-gray-200 min-h-[120px]">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {signal.adminNotes || 'No admin notes added yet.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Assignment */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>
                    {isEditing ? (
                      <select
                        value={editData.assignedTo}
                        onChange={(e) => setEditData({ ...editData, assignedTo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Unassigned</option>
                        {collectors.map((collector) => (
                          <option key={collector.id} value={collector.id}>
                            {collector.name} - {collector.email}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="bg-white p-4 rounded-md border border-gray-200">
                        {assignedCollector ? (
                          <div className="space-y-2">
                            <p className="font-medium text-gray-900">{assignedCollector.name}</p>
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-4 w-4 mr-2" />
                              {assignedCollector.email}
                            </div>
                            {assignedCollector.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-4 w-4 mr-2" />
                                {assignedCollector.phone}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">Not assigned to any collector</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Signal ID */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Signal ID</h3>
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      <code className="text-sm text-gray-600 font-mono">{signal.id}</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SignalDetailsView;
