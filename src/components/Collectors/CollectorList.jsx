import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Plus, Trash2, Mail, Users, AlertCircle } from 'lucide-react';
import { getCollectors, addCollector, removeCollector } from '../../firebase/firestore';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required')
});

const CollectorList = () => {
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    loadCollectors();
  }, []);

  const loadCollectors = async () => {
    try {
      setLoading(true);
      setError(null);
      const collectorsData = await getCollectors();
      setCollectors(collectorsData);
    } catch (err) {
      console.error('Error loading collectors:', err);
      setError('Failed to load collectors');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollector = async (data) => {
    try {
      setSubmitting(true);
      setError(null);
      await addCollector(data.email);
      reset();
      setShowAddForm(false);
      await loadCollectors();
    } catch (err) {
      console.error('Error adding collector:', err);
      setError(err.message || 'Failed to add collector');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveCollector = async (collectorId, email) => {
    if (!window.confirm(`Are you sure you want to remove ${email} as a collector?`)) {
      return;
    }

    try {
      setError(null);
      await removeCollector(collectorId);
      await loadCollectors();
    } catch (err) {
      console.error('Error removing collector:', err);
      setError('Failed to remove collector');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Users className="h-6 w-6 text-green-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">
            Waste Collectors ({collectors.length})
          </h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Collector
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Collector Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Collector</h3>
          <form onSubmit={handleSubmit(handleAddCollector)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="collector@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  reset();
                  setError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add Collector'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Collectors List */}
      <div className="bg-white rounded-lg shadow-sm">
        {collectors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No collectors found</p>
            <p className="text-sm text-gray-400 mt-1">
              Add collectors to assign waste signals to them
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {collectors.map((collector) => (
                  <tr key={collector.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-full mr-3">
                          <Mail className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {collector.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {collector.createdAt 
                        ? collector.createdAt.toDate().toLocaleDateString()
                        : 'N/A'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveCollector(collector.id, collector.email)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50"
                        title="Remove collector"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectorList;
