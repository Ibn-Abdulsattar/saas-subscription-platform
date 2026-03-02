import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './common/Navbar';
import Sidebar from './common/Sidebar';
import { useSelector } from 'react-redux';

const Layout = () => {
  const { sidebarOpen } = useSelector(state => state.ui);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;