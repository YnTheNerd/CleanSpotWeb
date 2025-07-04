import React, { useState } from 'react';
import { MapPin, Calendar, User, AlertCircle, Edit3, Save, X, Clock, ChevronRight } from 'lucide-react';
import { updateSignal, getCollectors } from '../../firebase/firestore';

const SignalListView = ({ signals, onUpdate }) => {
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
        return 'bg-red-100 text-red-800 border-red-200';
      case 'normal':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString() + ' ' + timestamp.toDate().toLocaleTimeString();
  };

  const handleEdit = async (signal) => {
    setEditingId(signal.id);
    setEditData({
      status: signal.status,
      priority: signal.priority,
      adminNotes: signal.adminNotes || '',
      assignedTo: signal.assignedTo || ''
    });

    // Load collectors
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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Signal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reporter
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {signals.map((signal) => (
              <tr key={signal.id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {signal.description}
                    </p>
                    {signal.adminNotes && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Note: {signal.adminNotes}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === signal.id ? (
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  ) : (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(signal.status)}`}>
                      {signal.status.replace('_', ' ')}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === signal.id ? (
                    <select
                      value={editData.priority}
                      onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                      className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  ) : (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(signal.priority)}`}>
                      {signal.priority}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate max-w-xs">
                      {signal.location?.address || 'No address'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate max-w-xs">
                      {signal.userEmail}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="text-xs">
                      {formatDate(signal.createdAt)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === signal.id ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSave(signal.id)}
                        disabled={loading}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50 transition-colors duration-200"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(signal)}
                      className="text-green-600 hover:text-green-900 transition-colors duration-200"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SignalListView;
