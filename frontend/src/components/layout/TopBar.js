import React from 'react';
import { FaBell, FaUserCircle } from 'react-icons/fa';

const TopBar = ({ user }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            {window.location.pathname.includes('/admin') && 'Admin Dashboard'}
            {window.location.pathname.includes('/instructor') && 'Instructor Portal'}
            {window.location.pathname.includes('/student') && 'Student Portal'}
          </h1>
          <p className="text-sm text-gray-500">
            Welcome, {user?.first_name} {user?.last_name}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-gray-800 focus:outline-none">
            <FaBell className="h-6 w-6" />
          </button>
          
          <div className="relative">
            <button className="flex items-center focus:outline-none">
              <div className="flex items-center">
                <FaUserCircle className="h-8 w-8 text-gray-600" />
                <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                  {user?.first_name} {user?.last_name}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
