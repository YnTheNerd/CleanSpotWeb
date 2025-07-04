import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { subscribeToStats, getSignalTrends, getTopReporters } from '../../firebase/firestore';
import { TrendingUp, Users, AlertCircle, CheckCircle, Clock, BarChart3 } from 'lucide-react';

const StatsChart = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    high_priority: 0,
    normal_priority: 0,
    low_priority: 0
  });
  const [trends, setTrends] = useState([]);
  const [topReporters, setTopReporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to real-time stats
    const unsubscribeStats = subscribeToStats((newStats) => {
      setStats(newStats);
    });

    // Load trends and top reporters
    const loadData = async () => {
      try {
        const [trendsData, reportersData] = await Promise.all([
          getSignalTrends(30),
          getTopReporters(10)
        ]);
        setTrends(trendsData);
        setTopReporters(reportersData);
      } catch (err) {
        console.error('Error loading stats data:', err);
        setError('Failed to load statistics data');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => unsubscribeStats();
  }, []);

  const statusData = [
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'In Progress', value: stats.in_progress, color: '#3b82f6' },
    { name: 'Resolved', value: stats.resolved, color: '#10b981' }
  ];

  const priorityData = [
    { name: 'High', value: stats.high_priority, color: '#ef4444' },
    { name: 'Normal', value: stats.normal_priority, color: '#f59e0b' },
    { name: 'Low', value: stats.low_priority, color: '#10b981' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Signals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.in_progress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trends Chart */}
      {trends.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Signal Trends (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#6b7280" name="Total" />
              <Line type="monotone" dataKey="pending" stroke="#f59e0b" name="Pending" />
              <Line type="monotone" dataKey="in_progress" stroke="#3b82f6" name="In Progress" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Reporters */}
      {topReporters.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Top Reporters
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Reports
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resolved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topReporters.map((reporter, index) => (
                  <tr key={reporter.userId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reporter.userId.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reporter.totalReports}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reporter.resolvedReports || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reporter.totalReports > 0 
                        ? Math.round(((reporter.resolvedReports || 0) / reporter.totalReports) * 100)
                        : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsChart;
