// src/components/Layout.tsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Settings, 
  Bell, 
  Sun, 
  Moon,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Search,
  Activity,
  Shield,
  Users,
  Layout as LayoutIcon,
  FileText,
  Grid,
  Flag,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentTenant } = useTenant();

  const menuItems = [
    { path: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/cicd', icon: <GitBranch size={20} />, label: 'CI/CD' },
    { path: '/logging', icon: <Search size={20} />, label: 'Logging' },
    { path: '/metrics', icon: <Activity size={20} />, label: 'Metrics' },
    { path: '/identity', icon: <Shield size={20} />, label: 'Identity' },
    { path: '/configurationManagement', icon: <Grid size={20} />, label: 'configurationManagement' },
    { path: '/featureManagement', icon: <Flag size={20} />, label: 'featureManagement' },
    { path: '/roles', icon: <Users size={20} />, label: 'Roles' },
    { path: '/page-builder', icon: <LayoutIcon size={20} />, label: 'Page Builder' },
    { path: '/audit-log', icon: <FileText size={20} />, label: 'Audit Log' },
    { path: '/notifications', icon: <Bell size={20} />, label: 'Notifications' }
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Mock notifications - in real app, this would come from a service
  useEffect(() => {
    setNotifications([
      {
        id: '1',
        title: 'Deployment Complete',
        message: 'Frontend application deployed successfully',
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: '2',
        title: 'High CPU Usage',
        message: 'Server CPU usage exceeds 80%',
        type: 'warning',
        timestamp: new Date().toISOString(),
        read: false
      }
    ]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Bell className="h-6 w-6 text-blue-500" />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <aside 
          className={`${
            sidebarCollapsed ? 'w-20' : 'w-64'
          } transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
        >
          <div className="flex flex-col h-full">
            {/* Tenant Info */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-semibold text-gray-800 dark:text-white truncate">
                    {currentTenant?.name || 'Admin'}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {currentTenant?.subscription?.plan || 'Free'}
                  </span>
                </div>
              )}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-2 px-3">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center ${
                        sidebarCollapsed ? 'justify-center' : 'justify-start'
                      } px-3 py-2 rounded-lg transition-all duration-200 ${
                        location.pathname === item.path
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="flex items-center">
                        {item.icon}
                      </span>
                      {!sidebarCollapsed && (
                        <span className="ml-3 text-sm font-medium">{item.label}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* User Profile */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              {!sidebarCollapsed && (
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                        {user?.name?.[0] || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top navbar */}
          <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 -mt-1 -mr-1 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Notifications
                        </h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 ${
                              !notification.read 
                                ? 'bg-indigo-50 dark:bg-indigo-900/20' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-start">
                              {getNotificationIcon(notification.type)}
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {notification.title}
                                </p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                  {notification.message}
                                </p>
                                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                  {new Date(notification.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => navigate('/notifications')}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                        >
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Settings */}
                <Link 
                  to="/settings"
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings size={20} />
                </Link>

                {/* User Menu */}
                <button onClick={logout}
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;