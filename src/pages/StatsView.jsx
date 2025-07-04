import React from 'react';
import StatsChart from '../components/Stats/StatsChart';

const StatsView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Statistics & Analytics
        </h1>
        <p className="text-gray-600">
          Comprehensive analytics and insights about waste signal reports
        </p>
      </div>
      
      <StatsChart />
    </div>
  );
};

export default StatsView;
