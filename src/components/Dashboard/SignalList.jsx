import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import SignalCard from './SignalCard';
import { getSignals } from '../../firebase/firestore';

const SignalList = () => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      startDate: '',
      endDate: '',
      search: ''
    });
  };

  const filteredSignals = signals.filter(signal => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        signal.description.toLowerCase().includes(searchLower) ||
        signal.userEmail.toLowerCase().includes(searchLower) ||
        signal.location?.address?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading && signals.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Waste Signals</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            <ChevronDown className={`h-4 w-4 ml-2 transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search signals..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Signals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSignals.map((signal) => (
          <SignalCard
            key={signal.id}
            signal={signal}
            onUpdate={() => loadSignals()}
          />
        ))}
      </div>

      {/* Load More */}
      {pagination.hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => loadSignals(true)}
            disabled={pagination.loading}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium disabled:opacity-50"
          >
            {pagination.loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {filteredSignals.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No signals found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default SignalList;