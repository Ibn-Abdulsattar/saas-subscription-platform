import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import TaskIcon from '@mui/icons-material/Task';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';

const Sidebar = () => {
  const { sidebarOpen } = useSelector(state => state.ui);

  const menuItems = [
    { path: '/dashboard', icon: DashboardIcon, label: 'Dashboard' },
    { path: '/projects', icon: FolderIcon, label: 'Projects' },
    { path: '/tasks', icon: TaskIcon, label: 'Tasks' },
    { path: '/team', icon: GroupIcon, label: 'Team' },
    { path: '/billing', icon: PaymentIcon, label: 'Billing' },
    { path: '/profile', icon: PersonIcon, label: 'Profile' },
    { path: '/search', icon: SearchIcon, label: 'Search' },
  ];

  if (!sidebarOpen) return null;

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;