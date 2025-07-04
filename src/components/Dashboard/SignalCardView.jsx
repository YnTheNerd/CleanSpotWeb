import React, { useState } from 'react';
import { MapPin, Calendar, User, AlertCircle, Edit3, Save, X, Clock, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { updateSignal, getCollectors } from '../../firebase/firestore';
import { t, formatStatusText, formatPriorityText } from '../../utils/localization';
import SignalDetailModal from './SignalDetailModal';

const SignalCardView = ({ signals, onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      alert(t('messages.updateError') + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const toggleExpanded = (signalId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(signalId)) {
      newExpanded.delete(signalId);
    } else {
      newExpanded.add(signalId);
    }
    setExpandedCards(newExpanded);
  };

  const handleImageClick = (signal) => {
    setSelectedSignal(signal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSignal(null);
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {signals.map((signal) => {
          const isExpanded = expandedCards.has(signal.id);
          const isEditing = editingId === signal.id;

          return (
            <div
              key={signal.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 overflow-hidden border border-gray-200"
            >
            {/* Priority Indicator */}
            <div className={`h-1 ${getPriorityColor(signal.priority)}`}></div>

            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-3">
                    {signal.description}
                  </h3>
                  
                  {/* Status and Priority Badges */}
                  <div className="flex items-center space-x-2 mb-3">
                    {isEditing ? (
                      <>
                        <select
                          value={editData.status}
                          onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                          className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="pending">{formatStatusText('pending')}</option>
                          <option value="in_progress">{formatStatusText('in_progress')}</option>
                          <option value="resolved">{formatStatusText('resolved')}</option>
                        </select>
                        <select
                          value={editData.priority}
                          onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                          className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="low">{formatPriorityText('low')}</option>
                          <option value="normal">{formatPriorityText('normal')}</option>
                          <option value="high">{formatPriorityText('high')}</option>
                        </select>
                      </>
                    ) : (
                      <>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(signal.status)}`}>
                          {formatStatusText(signal.status)}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getPriorityColor(signal.priority)}`}>
                          {formatPriorityText(signal.priority)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSave(signal.id)}
                        disabled={loading}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 transition-colors duration-200"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(signal)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{signal.location?.address || t('modal.noAddress')}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{signal.userEmail}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{formatDate(signal.createdAt)}</span>
                </div>
              </div>

              {/* Image Preview - Enhanced with larger size and click handler */}
              {signal.imageUrl && (
                <div className="mt-4">
                  <img
                    src={signal.imageUrl}
                    alt="Signal"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity duration-200"
                    onClick={() => handleImageClick(signal)}
                  />
                </div>
              )}

              {/* Expand/Collapse Button */}
              <button
                onClick={() => toggleExpanded(signal.id)}
                className="w-full mt-4 flex items-center justify-center py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    {t('buttons.showLess')}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    {t('buttons.showMore')}
                  </>
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 animate-fadeIn">
                  {/* Admin Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.adminNotes')}</label>
                    {isEditing ? (
                      <textarea
                        value={editData.adminNotes}
                        onChange={(e) => setEditData({ ...editData, adminNotes: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                        placeholder={t('form.adminNotes') + '...'}
                      />
                    ) : (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {signal.adminNotes || t('modal.noAdminNotes')}
                      </p>
                    )}
                  </div>

                  {/* Assigned To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.assignedTo')}</label>
                    {isEditing ? (
                      <select
                        value={editData.assignedTo}
                        onChange={(e) => setEditData({ ...editData, assignedTo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                      >
                        <option value="">{t('modal.unassigned')}</option>
                        {collectors.map((collector) => (
                          <option key={collector.id} value={collector.id}>
                            {collector.name} - {collector.email}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {signal.assignedTo ? 
                          collectors.find(c => c.id === signal.assignedTo)?.name || signal.assignedTo 
                          : t('modal.unassigned')
                        }
                      </p>
                    )}
                  </div>

                  {/* Location Details */}
                  {signal.location && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.locationDetails')}</label>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md space-y-1">
                        {signal.location.coordinates && (
                          <p>{t('form.coordinates')}: {signal.location.coordinates.latitude}, {signal.location.coordinates.longitude}</p>
                        )}
                        {signal.location.address && (
                          <p>{t('form.address')}: {signal.location.address}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>

      {/* Signal Detail Modal */}
      <SignalDetailModal
        signal={selectedSignal}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default SignalCardView;
