import React from 'react';
import EnhancedSignalList from '../components/Dashboard/EnhancedSignalList';
import { t } from '../utils/localization';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('pages.dashboard.title')}
        </h1>
        <p className="text-gray-600">
          {t('pages.dashboard.subtitle')}
        </p>
      </div>

      <EnhancedSignalList />
    </div>
  );
};

export default Dashboard;
