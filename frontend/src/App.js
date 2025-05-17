import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';

// Home Page Component
const Home = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-800 opacity-90"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Start Your Driving Journey Today</h1>
              <p className="text-xl mb-8">
                Find the best driving schools in your area, choose qualified instructors, and get your license with ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/register')} 
                  className="px-6 py-3 bg-yellow-500 text-gray-900 font-bold rounded-md hover:bg-yellow-400 transition duration-300"
                >
                  Start Your Registration
                </button>
                <button 
                  onClick={() => navigate('/school-register')}
                  className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-md hover:bg-white hover:text-blue-900 transition duration-300"
                >
                  Register Your Driving School
                </button>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Driver Education" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-blue-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">1</div>
              <h3 className="text-xl font-semibold mb-3">Theory Course</h3>
              <p className="text-gray-600">
                Learn traffic laws, road signs, and essential driving theory in our comprehensive online course.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-blue-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">2</div>
              <h3 className="text-xl font-semibold mb-3">Parking Practice</h3>
              <p className="text-gray-600">
                Master the art of parking your vehicle with personalized one-on-one lessons with qualified instructors.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-blue-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">3</div>
              <h3 className="text-xl font-semibold mb-3">Road Driving</h3>
              <p className="text-gray-600">
                Apply your skills on real roads with professional guidance ensuring you're ready for your license exam.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Qualified Instructors</h3>
              <p className="text-gray-600">Experienced and certified instructors for quality education.</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Scheduling</h3>
              <p className="text-gray-600">Choose lesson times that work with your busy schedule.</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sequential Learning</h3>
              <p className="text-gray-600">Step-by-step progression through courses for optimal learning.</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Online Payments</h3>
              <p className="text-gray-600">Secure and convenient payment methods for all courses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">58</div>
              <div className="text-gray-400">States Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-gray-400">Driving Schools</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-gray-400">Qualified Instructors</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-gray-400">Successful Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Driving School Management</h3>
              <p className="text-gray-400">
                Find the best driving schools in your area and get your driving license with ease.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Courses</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Theory Course</li>
                <li>Parking Practice</li>
                <li>Road Driving</li>
                <li>Exam Preparation</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register" className="hover:text-white transition">Register as Student</Link></li>
                <li><Link to="/school-register" className="hover:text-white transition">Register Driving School</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Student Login</Link></li>
                <li><Link to="/school-login" className="hover:text-white transition">School Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@drivingschool.com</li>
                <li>Phone: +123 456 7890</li>
                <li>Address: 123 Driving Street, Algeria</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 Driving School Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// State Selection Component
const StateSelect = ({ onStateSelect }) => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/states`);
        if (!response.ok) {
          throw new Error('Failed to fetch states');
        }
        const data = await response.json();
        setStates(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchStates();
  }, []);
  
  if (loading) return <div className="text-center py-4">Loading states...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Select Your State</h2>
      <p className="mb-4 text-gray-600">We'll show you driving schools in your selected region</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {states.map(state => (
          <button
            key={state.id}
            onClick={() => onStateSelect(state)}
            className="p-3 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300 transition"
          >
            {state.name}
          </button>
        ))}
      </div>
    </div>
  );
};

// School List Component
const SchoolList = ({ stateId, stateName }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/schools/by-state/${stateId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch schools');
        }
        const data = await response.json();
        setSchools(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchSchools();
  }, [stateId]);
  
  if (loading) return <div className="text-center py-4">Loading schools...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Driving Schools in {stateName}</h2>
      
      {schools.length === 0 ? (
        <p className="text-center py-8 text-gray-500">No driving schools found in this state.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {schools.map(school => (
            <div key={school.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{school.name}</h3>
                  <p className="text-gray-500">{school.address}</p>
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {school.rating.toFixed(1)}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {school.phone}
                </span>
                <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {school.email}
                </span>
              </div>
              <p className="mt-3 text-gray-600 line-clamp-2">{school.description || "No description provided."}</p>
              <div className="mt-4">
                <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Registration Page Component
const Registration = () => {
  const [selectedState, setSelectedState] = useState(null);
  const [usingGeolocation, setUsingGeolocation] = useState(false);
  const [geolocationError, setGeolocationError] = useState(null);
  
  // Try to get user's location
  const detectLocation = () => {
    setUsingGeolocation(true);
    setGeolocationError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // In a real app, you would send these coordinates to the backend
            // to determine the state, or use a geocoding service
            
            // For now, we'll just show the manual selection
            setUsingGeolocation(false);
          } catch (error) {
            setGeolocationError("Failed to determine your location.");
            setUsingGeolocation(false);
          }
        },
        (error) => {
          setGeolocationError("Location permission denied. Please select your state manually.");
          setUsingGeolocation(false);
        }
      );
    } else {
      setGeolocationError("Geolocation is not supported by your browser.");
      setUsingGeolocation(false);
    }
  };
  
  useEffect(() => {
    // Try to detect location when component mounts
    detectLocation();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl font-bold">Driving School Management</Link>
            <div>
              <Link to="/login" className="text-white hover:text-blue-200 mr-4">Login</Link>
              <Link to="/register" className="bg-yellow-500 text-gray-900 px-4 py-2 rounded font-semibold hover:bg-yellow-400 transition">Register</Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Find a Driving School</h1>
          
          {usingGeolocation ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p>Detecting your location...</p>
            </div>
          ) : geolocationError ? (
            <div className="mb-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">{geolocationError}</p>
                  </div>
                </div>
              </div>
              <StateSelect onStateSelect={setSelectedState} />
            </div>
          ) : (
            <div className="mb-6">
              <StateSelect onStateSelect={setSelectedState} />
            </div>
          )}
          
          {selectedState && (
            <div className="mt-8">
              <SchoolList stateId={selectedState.id} stateName={selectedState.name} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// School Registration Form Component
const SchoolRegister = () => {
  const [states, setStates] = useState([]);
  const [formData, setFormData] = useState({
    school: {
      name: '',
      address: '',
      phone: '',
      email: '',
      description: '',
      state_id: ''
    },
    manager: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      username: '',
      password: '',
      gender: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/states`);
        if (!response.ok) {
          throw new Error('Failed to fetch states');
        }
        const data = await response.json();
        setStates(data);
      } catch (err) {
        setError(err.message);
      }
    };
    
    fetchStates();
  }, []);
  
  const handleChange = (e, section) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value
      }
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/schools/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register driving school');
      }
      
      setSuccess(true);
      // Reset form
      setFormData({
        school: {
          name: '',
          address: '',
          phone: '',
          email: '',
          description: '',
          state_id: ''
        },
        manager: {
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          username: '',
          password: '',
          gender: ''
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl font-bold">Driving School Management</Link>
            <div>
              <Link to="/login" className="text-white hover:text-blue-200 mr-4">Login</Link>
              <Link to="/register" className="bg-yellow-500 text-gray-900 px-4 py-2 rounded font-semibold hover:bg-yellow-400 transition">Register</Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Register Your Driving School</h1>
          
          {success ? (
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Your driving school has been registered successfully! Our team will review your information and contact you shortly.
                  </p>
                  <div className="mt-4">
                    <Link to="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:border-green-700 focus:shadow-outline-green active:bg-green-700 transition ease-in-out duration-150">
                      Return to Home
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 pb-2 border-b">School Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                    <input
                      type="text"
                      id="schoolName"
                      name="name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.school.name}
                      onChange={(e) => handleChange(e, 'school')}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="schoolAddress" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      id="schoolAddress"
                      name="address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.school.address}
                      onChange={(e) => handleChange(e, 'school')}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="schoolPhone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        id="schoolPhone"
                        name="phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.school.phone}
                        onChange={(e) => handleChange(e, 'school')}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="schoolEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        id="schoolEmail"
                        name="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.school.email}
                        onChange={(e) => handleChange(e, 'school')}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="schoolState" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <select
                      id="schoolState"
                      name="state_id"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.school.state_id}
                      onChange={(e) => handleChange(e, 'school')}
                      required
                    >
                      <option value="">Select a state</option>
                      {states.map(state => (
                        <option key={state.id} value={state.id}>{state.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="schoolDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      id="schoolDescription"
                      name="description"
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.school.description}
                      onChange={(e) => handleChange(e, 'school')}
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Manager Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="managerFirstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        id="managerFirstName"
                        name="first_name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.manager.first_name}
                        onChange={(e) => handleChange(e, 'manager')}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="managerLastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        id="managerLastName"
                        name="last_name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.manager.last_name}
                        onChange={(e) => handleChange(e, 'manager')}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="managerEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        id="managerEmail"
                        name="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.manager.email}
                        onChange={(e) => handleChange(e, 'manager')}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="managerPhone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        id="managerPhone"
                        name="phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.manager.phone}
                        onChange={(e) => handleChange(e, 'manager')}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="managerUsername" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      id="managerUsername"
                      name="username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.manager.username}
                      onChange={(e) => handleChange(e, 'manager')}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="managerPassword" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      id="managerPassword"
                      name="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.manager.password}
                      onChange={(e) => handleChange(e, 'manager')}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          checked={formData.manager.gender === 'male'}
                          onChange={(e) => handleChange(e, 'manager')}
                          required
                        />
                        <span className="ml-2">Male</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          checked={formData.manager.gender === 'female'}
                          onChange={(e) => handleChange(e, 'manager')}
                        />
                        <span className="ml-2">Female</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-6 rounded-md font-semibold hover:bg-blue-700 transition disabled:bg-blue-300"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : "Register Driving School"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/school-register" element={<SchoolRegister />} />
      </Routes>
    </Router>
  );
}

export default App;
