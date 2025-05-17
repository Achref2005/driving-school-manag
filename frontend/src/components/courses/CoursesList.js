import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaEdit, FaEye, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import { courseService } from '../../services/api';

const CoursesList = ({ auth }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseService.getAll();
        setCourses(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses based on search term
  const filteredCourses = courses.filter(
    course => 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.license_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Courses</h1>
        {auth.user.role === 'admin' && (
          <Link
            to="/admin/courses/add"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
          >
            <FaPlus className="mr-2" /> Add New Course
          </Link>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No courses match your search.' : 'No courses found.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-700">
                  <h3 className="text-xl font-semibold text-white truncate">{course.name}</h3>
                  <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded bg-blue-200 text-blue-900">
                    License Type: {course.license_type}
                  </span>
                </div>
                
                <div className="p-4">
                  <p className="text-gray-600 line-clamp-2 h-12 mb-4">
                    {course.description || 'No description available.'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <FaCalendarAlt className="text-green-600" />
                      </div>
                      <div className="ml-2">
                        <p className="text-xs text-gray-500">Hours</p>
                        <p className="text-sm font-medium">Theory: {course.theory_hours}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <FaCalendarAlt className="text-green-600" />
                      </div>
                      <div className="ml-2">
                        <p className="text-xs text-gray-500">Hours</p>
                        <p className="text-sm font-medium">Practical: {course.practical_hours}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaMoneyBillWave className="text-blue-600" />
                    </div>
                    <div className="ml-2">
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-lg font-semibold">${course.price.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {course.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    
                    <div className="flex space-x-2">
                      <Link 
                        to={`/admin/courses/${course.id}`} 
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FaEye />
                      </Link>
                      {auth.user.role === 'admin' && (
                        <Link 
                          to={`/admin/courses/${course.id}/edit`} 
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <FaEdit />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesList;
