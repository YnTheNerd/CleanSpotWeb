import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { t } from '../../utils/localization';
import {
  LayoutDashboard,
  Map,
  BarChart3,
  Users,
  LogOut,
  Trash2
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navItems = [
    { path: '/dashboard', label: t('navigation.dashboard'), icon: LayoutDashboard },
    { path: '/heatmap', label: t('navigation.heatmap'), icon: Map },
    { path: '/stats', label: t('navigation.statistics'), icon: BarChart3 },
    { path: '/collectors', label: t('navigation.collectors'), icon: Users },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-green-600 p-2 rounded-lg">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">CleanSpot Admin</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-green-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-4">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('navigation.logout')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;