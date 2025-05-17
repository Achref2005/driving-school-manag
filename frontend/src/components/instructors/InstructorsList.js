import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserPlus, FaSearch, FaEdit, FaEye, FaCalendarAlt } from 'react-icons/fa';
import { instructorService } from '../../services/api';

const InstructorsList = ({ auth }) => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        const response = await instructorService.getAll();
        setInstructors(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching instructors:', err);
        setError('Failed to load instructors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  // Filter instructors based on search term
  const filteredInstructors = instructors.filter(
    instructor => 
      instructor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (instructor.phone && instructor.phone.includes(searchTerm)) ||
      (instructor.specializations && instructor.specializations.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <h1 className="text-2xl font-bold">Instructors</h1>
        {auth.user.role === 'admin' && (
          <Link
            to="/admin/instructors/add"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
          >
            <FaUserPlus className="mr-2" /> Add New Instructor
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
              placeholder="Search instructors..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredInstructors.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No instructors match your search.' : 'No instructors found.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredInstructors.map((instructor) => (
              <div key={instructor.id} className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="p-4 border-b bg-gradient-to-r from-green-500 to-green-700">
                  <h3 className="text-xl font-semibold text-white">{instructor.first_name} {instructor.last_name}</h3>
                </div>
                
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Email: {instructor.email}</p>
                    <p className="text-sm text-gray-600">Phone: {instructor.phone || 'Not provided'}</p>
                    <p className="text-sm text-gray-600">License: {instructor.license_number}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Specializations:</p>
                    <p className="text-sm text-gray-600">{instructor.specializations || 'Not specified'}</p>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaCalendarAlt className="text-blue-600" />
                    </div>
                    <div className="ml-2">
                      <p className="text-xs text-gray-500">Teaching Hours</p>
                      <p className="text-lg font-semibold">{instructor.teaching_hours || 0} hours</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${instructor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {instructor.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    
                    <div className="flex space-x-2">
                      <Link 
                        to={`/admin/instructors/${instructor.id}/schedule`} 
                        className="text-green-600 hover:text-green-900"
                        title="View Schedule"
                      >
                        <FaCalendarAlt />
                      </Link>
                      <Link 
                        to={`/admin/instructors/${instructor.id}`} 
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FaEye />
                      </Link>
                      {auth.user.role === 'admin' && (
                        <Link 
                          to={`/admin/instructors/${instructor.id}/edit`} 
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

export default InstructorsList;
