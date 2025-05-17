import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaCalendarAlt, FaCar, FaBook, FaMoneyBillWave, FaChartLine, FaSignOutAlt, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();
  const { role } = user || { role: 'guest' };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Define menu items based on user role
  const getMenuItems = () => {
    const adminItems = [
      { to: '/admin/dashboard', icon: <FaHome size={20} />, label: 'Dashboard' },
      { to: '/admin/students', icon: <FaUserGraduate size={20} />, label: 'Students' },
      { to: '/admin/instructors', icon: <FaChalkboardTeacher size={20} />, label: 'Instructors' },
      { to: '/admin/courses', icon: <FaBook size={20} />, label: 'Courses' },
      { to: '/admin/schedule', icon: <FaCalendarAlt size={20} />, label: 'Schedule' },
      { to: '/admin/vehicles', icon: <FaCar size={20} />, label: 'Vehicles' },
      { to: '/admin/payments', icon: <FaMoneyBillWave size={20} />, label: 'Payments' },
      { to: '/admin/reports', icon: <FaChartLine size={20} />, label: 'Reports' },
    ];

    const instructorItems = [
      { to: '/instructor/dashboard', icon: <FaHome size={20} />, label: 'Dashboard' },
      { to: '/instructor/schedule', icon: <FaCalendarAlt size={20} />, label: 'My Schedule' },
      { to: '/instructor/students', icon: <FaUserGraduate size={20} />, label: 'My Students' },
    ];

    const studentItems = [
      { to: '/student/dashboard', icon: <FaHome size={20} />, label: 'Dashboard' },
      { to: '/student/courses', icon: <FaBook size={20} />, label: 'My Courses' },
      { to: '/student/schedule', icon: <FaCalendarAlt size={20} />, label: 'My Schedule' },
      { to: '/student/payments', icon: <FaMoneyBillWave size={20} />, label: 'Payments' },
    ];

    switch (role) {
      case 'admin':
        return adminItems;
      case 'instructor':
        return instructorItems;
      case 'student':
        return studentItems;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="bg-blue-800 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4 border-b border-blue-700">
        <h2 className="text-2xl font-bold">Driving School</h2>
        <p className="text-sm text-blue-300 mt-1">Management System</p>
      </div>
      
      <div className="p-4 border-b border-blue-700">
        <p className="text-sm text-blue-300">Logged in as:</p>
        <p className="font-semibold">{user?.first_name} {user?.last_name}</p>
        <p className="text-xs text-blue-300 capitalize">{role}</p>
      </div>
      
      <div className="flex-grow">
        <ul className="mt-4">
          {menuItems.map((item) => (
            <li key={item.to} className="mb-2">
              <Link
                to={item.to}
                className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                  isActive(item.to)
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-200 hover:bg-blue-700 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 border-t border-blue-700">
        <button
          onClick={onLogout}
          className="flex items-center text-blue-200 hover:text-white transition-colors duration-200 w-full"
        >
          <FaSignOutAlt className="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
