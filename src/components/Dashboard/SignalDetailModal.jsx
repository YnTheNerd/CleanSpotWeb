import React, { useEffect } from 'react';
import { X, MapPin, Calendar, User, Clock, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { t, formatStatusText, formatPriorityText } from '../../utils/localization';

const SignalDetailModal = ({ signal, isOpen, onClose }) => {
  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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
        return 'bg-red-500 text-white';
      case 'normal':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen || !signal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-modalSlideIn">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-semibold text-gray-900">{t('modal.signalDetails')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status and Priority Badges */}
          <div className="flex items-center space-x-3 mb-6">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(signal.status)}`}>
              {formatStatusText(signal.status)}
            </span>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(signal.priority)}`}>
              {formatPriorityText(signal.priority)} {t('priority.priority')}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image and Description */}
            <div className="space-y-6">
              {/* Large Image Display */}
              {signal.imageUrl ? (
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <img
                    src={signal.imageUrl}
                    alt="Signal"
                    className="w-full h-80 object-cover"
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg h-80 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <ImageIcon className="h-16 w-16 mx-auto mb-2" />
                    <p>No image available</p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('form.description')}</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {signal.description || t('modal.noDescription')}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('modal.information')}</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('form.reporter')}</p>
                      <p className="text-gray-600">{signal.userEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('time.reported')}</p>
                      <p className="text-gray-600">{formatDate(signal.createdAt)}</p>
                    </div>
                  </div>

                  {signal.updatedAt && (
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{t('time.lastUpdated')}</p>
                        <p className="text-gray-600">{formatDate(signal.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Details */}
              {signal.location && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('form.location')}</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {signal.location.coordinates && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">{t('form.coordinates')}</p>
                          <p className="text-gray-600 font-mono text-sm">
                            {signal.location.coordinates.latitude}, {signal.location.coordinates.longitude}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {signal.location.address && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">{t('form.address')}</p>
                          <p className="text-gray-600">{signal.location.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('form.adminNotes')}</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {signal.adminNotes || t('modal.noAdminNotes')}
                  </p>
                </div>
              </div>

              {/* Assignment */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('form.assignment')}</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    {signal.assignedTo ? `${t('form.assignedTo')}: ${signal.assignedTo}` : t('modal.unassigned')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalDetailModal;
