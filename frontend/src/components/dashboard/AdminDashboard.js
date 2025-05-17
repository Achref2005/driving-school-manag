import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserGraduate, FaChalkboardTeacher, FaCar, FaCalendarAlt, FaMoneyBillWave, FaBook } from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const AdminDashboard = ({ auth }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Transform exam data for charts
  const examChartData = stats?.examStats ? Object.entries(stats.examStats).map(([type, data]) => ({
    name: type === 'theory' ? 'Theory' : 'Practical',
    passRate: parseFloat(data.pass_rate.toFixed(1)),
    pass: data.pass,
    fail: data.fail
  })) : [];

  // Transform course enrollment data for charts
  const courseChartData = stats?.courseEnrollments || [];

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <FaUserGraduate className="h-8 w-8 text-blue-700" />
          </div>
          <div>
            <p className="text-sm text-gray-600 uppercase">Active Students</p>
            <p className="text-2xl font-bold">{stats?.activeStudents || 0}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <FaChalkboardTeacher className="h-8 w-8 text-green-700" />
          </div>
          <div>
            <p className="text-sm text-gray-600 uppercase">Active Instructors</p>
            <p className="text-2xl font-bold">{stats?.activeInstructors || 0}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-yellow-100 p-3 mr-4">
            <FaCar className="h-8 w-8 text-yellow-700" />
          </div>
          <div>
            <p className="text-sm text-gray-600 uppercase">Active Vehicles</p>
            <p className="text-2xl font-bold">{stats?.activeVehicles || 0}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <FaBook className="h-8 w-8 text-purple-700" />
          </div>
          <div>
            <p className="text-sm text-gray-600 uppercase">Enrollments This Month</p>
            <p className="text-2xl font-bold">{stats?.enrollmentsThisMonth || 0}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-red-100 p-3 mr-4">
            <FaCalendarAlt className="h-8 w-8 text-red-700" />
          </div>
          <div>
            <p className="text-sm text-gray-600 uppercase">Upcoming Lessons</p>
            <p className="text-2xl font-bold">{stats?.upcomingLessons || 0}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-indigo-100 p-3 mr-4">
            <FaMoneyBillWave className="h-8 w-8 text-indigo-700" />
          </div>
          <div>
            <p className="text-sm text-gray-600 uppercase">Revenue This Month</p>
            <p className="text-2xl font-bold">${parseFloat(stats?.revenueThisMonth || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Course Enrollments Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Course Enrollments</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Enrollments']} />
                <Legend />
                <Bar dataKey="enrollment_count" name="Enrollments" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Exam Pass Rate Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Exam Pass Rates</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={examChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, name === 'passRate' ? 'Pass Rate (%)' : name]} />
                <Legend />
                <Bar dataKey="passRate" name="Pass Rate (%)" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Activity and Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-gray-500 italic">No recent activity to display.</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
          <div className="flex flex-col space-y-2">
            <a href="/admin/students/add" className="text-blue-600 hover:underline">Add New Student</a>
            <a href="/admin/instructors/add" className="text-blue-600 hover:underline">Add New Instructor</a>
            <a href="/admin/courses/add" className="text-blue-600 hover:underline">Create New Course</a>
            <a href="/admin/schedule" className="text-blue-600 hover:underline">View Schedule</a>
            <a href="/admin/reports" className="text-blue-600 hover:underline">Generate Reports</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
