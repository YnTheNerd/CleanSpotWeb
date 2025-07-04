import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Grid, List, Eye, ChevronDown } from 'lucide-react';
import { getSignals } from '../../firebase/firestore';
import { t, formatStatusText, formatPriorityText } from '../../utils/localization';
import SignalListView from './SignalListView';
import SignalCardView from './SignalCardView';
import SignalDetailsView from './SignalDetailsView';

const VIEW_MODES = {
  LIST: 'list',
  CARD: 'card',
  DETAILS: 'details'
};

const EnhancedSignalList = () => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(VIEW_MODES.CARD);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    startDate: '',
    endDate: '',
    assignedTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    hasMore: false,
    lastDoc: null
  });

  useEffect(() => {
    loadSignals();
  }, [filters]);

  const loadSignals = async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      const filterObj = {};
      if (filters.status) filterObj.status = filters.status;
      if (filters.priority) filterObj.priority = filters.priority;
      if (filters.startDate) filterObj.startDate = new Date(filters.startDate);
      if (filters.endDate) filterObj.endDate = new Date(filters.endDate);
      if (filters.assignedTo) filterObj.assignedTo = filters.assignedTo;

      const lastDoc = loadMore ? pagination.lastDoc : null;
      const result = await getSignals(filterObj, 20, lastDoc);

      if (loadMore) {
        setSignals(prev => [...prev, ...result.signals]);
      } else {
        setSignals(result.signals);
      }

      setPagination({
        currentPage: loadMore ? pagination.currentPage + 1 : 1,
        hasMore: result.hasMore,
        lastDoc: result.lastDoc
      });
    } catch (error) {
      console.error('Error loading signals:', error);
      setError('Failed to load signals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRefresh = () => {
    loadSignals();
  };

  const handleSignalUpdate = () => {
    loadSignals();
  };

  const filteredSignals = signals.filter(signal => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        signal.description.toLowerCase().includes(searchLower) ||
        signal.userEmail.toLowerCase().includes(searchLower) ||
        signal.location?.address?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const ViewModeButton = ({ mode, icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
        isActive
          ? 'bg-green-600 text-white shadow-md'
          : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 border border-gray-200'
      }`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </button>
  );

  if (loading && signals.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with View Mode Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Waste Signals</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredSignals.length} signal{filteredSignals.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <ViewModeButton
              mode={VIEW_MODES.LIST}
              icon={List}
              label="List"
              isActive={viewMode === VIEW_MODES.LIST}
              onClick={() => setViewMode(VIEW_MODES.LIST)}
            />
            <ViewModeButton
              mode={VIEW_MODES.CARD}
              icon={Grid}
              label="Cards"
              isActive={viewMode === VIEW_MODES.CARD}
              onClick={() => setViewMode(VIEW_MODES.CARD)}
            />
            <ViewModeButton
              mode={VIEW_MODES.DETAILS}
              icon={Eye}
              label="Details"
              isActive={viewMode === VIEW_MODES.DETAILS}
              onClick={() => setViewMode(VIEW_MODES.DETAILS)}
            />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('filters.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            <ChevronDown className={`h-4 w-4 ml-2 transform transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
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
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Signal Display */}
      <div className="transition-all duration-300 ease-in-out">
        {viewMode === VIEW_MODES.LIST && (
          <SignalListView signals={filteredSignals} onUpdate={handleSignalUpdate} />
        )}
        {viewMode === VIEW_MODES.CARD && (
          <SignalCardView signals={filteredSignals} onUpdate={handleSignalUpdate} />
        )}
        {viewMode === VIEW_MODES.DETAILS && (
          <SignalDetailsView signals={filteredSignals} onUpdate={handleSignalUpdate} />
        )}
      </div>

      {/* Load More Button */}
      {pagination.hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => loadSignals(true)}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedSignalList;
