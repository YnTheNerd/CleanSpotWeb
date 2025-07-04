import React from 'react';
import CollectorList from '../components/Collectors/CollectorList';

const Collectors = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Collector Management
        </h1>
        <p className="text-gray-600">
          Manage waste collectors who can be assigned to handle reported signals
        </p>
      </div>
      
      <CollectorList />
    </div>
  );
};

export default Collectors;
