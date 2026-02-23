import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';

export const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authAPI.register(formData);
      alert("Registration successful! Please login.");
      navigate('/login');
    } catch (err) {
      alert("Registration failed. Email might already exist.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Create Account</h2>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            type="text" required placeholder="Full Name"
            className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input
            type="email" required placeholder="Email address"
            className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input
            type="password" required placeholder="Password"
            className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Register
          </button>
          <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Already have an account? Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};