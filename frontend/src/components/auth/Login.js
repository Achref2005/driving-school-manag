import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const Login = ({ setAuth }) => {
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const initialValues = {
    username: '',
    password: ''
  };

  const validationSchema = Yup.object({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required')
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setServerError('');
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, values);
      
      // Store token and user info in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Update auth state
      setAuth({
        isAuthenticated: true,
        user: response.data.user,
        token: response.data.token
      });
      
      // Redirect based on role
      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.data.user.role === 'instructor') {
        navigate('/instructor/schedule');
      } else {
        navigate('/student/courses');
      }
    } catch (error) {
      console.error('Login error:', error);
      setServerError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg w-full max-w-md">
        <h3 className="text-2xl font-bold text-center">Driving School Management</h3>
        <p className="text-center text-gray-600 mb-6">Log in to your account</p>
        
        {serverError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span>{serverError}</span>
          </div>
        )}
        
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="mt-4">
                <div>
                  <label className="block" htmlFor="username">Username</label>
                  <Field
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Enter your username"
                    className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <ErrorMessage name="username" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                
                <div className="mt-4">
                  <label className="block" htmlFor="password">Password</label>
                  <Field
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                
                <div className="flex items-baseline justify-between">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </button>
                  <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
                </div>
              </div>
            </Form>
          )}
        </Formik>
        
        <div className="mt-6 text-center">
          <p>Don't have an account? Contact the admin to create one.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
