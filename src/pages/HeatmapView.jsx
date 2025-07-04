import React from 'react';
import Heatmap from '../components/Map/Heatmap';

const HeatmapView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Signal Heatmap
        </h1>
        <p className="text-gray-600">
          Interactive map showing the distribution of waste signals across Yaoundé
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Heatmap />
      </div>
    </div>
  );
};

export default HeatmapView;
