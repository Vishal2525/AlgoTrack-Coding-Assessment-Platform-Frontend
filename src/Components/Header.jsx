import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import axiosClient from '../utils/axiosClient';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // DEBUG: Log user data to see actual structure
  useEffect(() => {
    console.log('🔍 Header - User Data:', user);
    console.log('🔍 Header - Is Authenticated:', isAuthenticated);
    console.log('🔍 Header - User Role:', user?.role);
    // console.log('🔍 Header - Full Auth State:', useSelector((state) => state.auth));
  }, [user, isAuthenticated]);
// Check if user is admin - try different possible field names
  // Check if user is admin - try different possible field names
  const isAdmin = React.useMemo(() => {
    if (!user) return false;
    
    // Check multiple possible role field names
    const role = user.role || user.userRole || user.roles?.[0];
    console.log('🔍 Checking admin status - Role value:', role);
    
    return role === 'admin' || role === 'ADMIN' || role === 'Admin';
  }, [user]);

  console.log('🔍 isAdmin result:', isAdmin);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-dropdown-trigger') && !event.target.closest('.user-dropdown-content')) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axiosClient.post('/auth/logout');
      dispatch(logoutUser());
      setShowUserDropdown(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch(logoutUser());
      navigate('/login');
    }
  };

  // Get user's first initial for avatar
  const getUserInitial = () => {
    if (isAdmin) {
      return 'A'; // Admin gets 'A'
    }
    return user?.firstName?.charAt(0)?.toUpperCase() || 
           user?.firstname?.charAt(0)?.toUpperCase() || 
           user?.name?.charAt(0)?.toUpperCase() || 
           user?.email?.charAt(0)?.toUpperCase() || 
           'U'; // Regular user gets first letter or 'U'
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return '';
    
    const name = user.firstName || user.firstname || user.name || user.email?.split('@')[0] || 'User';
    
    if (isAdmin) {
      return `${name} (Admin)`;
    }
    return name;
  };

  // Handle create problem (admin only)
  const handleCreateProblem = async () => {
    if (!isAdmin) return;
    
    try {
      setShowUserDropdown(false);
      navigate('/admin/create-problem');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side: Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="font-bold text-xl">LC</span>
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:inline">
                LeetCode Clone
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/problems" className="hover:text-blue-400 transition-colors duration-200 font-medium">
                Problems
              </Link>
              <Link to="/solutions" className="hover:text-blue-400 transition-colors duration-200 font-medium">
                Solutions
              </Link>
              <Link to="/discuss" className="hover:text-blue-400 transition-colors duration-200 font-medium">
                Discuss
              </Link>
            </nav>
          </div>

          {/* Right side: User actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              /* User is logged in */
              <div className="relative user-dropdown-trigger">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 focus:outline-none hover:opacity-90 transition-opacity"
                >
                  <div className="relative">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      isAdmin 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    }`}>
                      <span className="font-semibold text-lg">
                        {getUserInitial()}
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                        <span className="text-xs font-bold">⭐</span>
                      </div>
                    )}
                  </div>
                  <span className="hidden md:inline font-medium">
                    {getUserDisplayName()}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {showUserDropdown && (
                  <div className="user-dropdown-content absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl py-2 z-50 border border-gray-700">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          isAdmin 
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        }`}>
                          <span className="font-semibold">
                            {getUserInitial()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {getUserDisplayName()}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-400 truncate">
                              {user.email || 'No email'}
                            </p>
                            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                              isAdmin 
                                ? 'bg-yellow-500/20 text-yellow-300' 
                                : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {isAdmin ? 'Admin' : 'User'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center px-4 py-3 hover:bg-gray-700/50 transition-colors duration-150"
                      >
                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                      
                      <Link
                        to="/settings"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center px-4 py-3 hover:bg-gray-700/50 transition-colors duration-150"
                      >
                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>
                      
                      {/* ADMIN ONLY: Create Problem Option */}
                      {isAdmin && (
                        <>
                          <div className="border-t border-gray-700 my-1"></div>
                          <div className="px-3 py-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Admin Tools</p>
                          </div>
                          <button
                            onClick={handleCreateProblem}
                            className="flex items-center w-full text-left px-4 py-3 hover:bg-gray-700/50 transition-colors duration-150 text-yellow-400"
                          >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Create Problem
                          </button>
                          
                          <Link
                            to="/admin"
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center px-4 py-3 hover:bg-gray-700/50 transition-colors duration-150 text-yellow-400"
                          >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A7 7 0 0115 10V5h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2h2.121" />
                            </svg>
                            Admin Dashboard
                          </Link>
                          <div className="border-t border-gray-700 my-1"></div>
                        </>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-3 hover:bg-red-900/20 transition-colors duration-150 text-red-400 font-medium mt-1"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* User is not logged in - Show Sign Up and Login buttons */
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors duration-200 hover:scale-105"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-md hover:bg-gray-800 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-800">
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/problems" 
                onClick={() => setShowMobileMenu(false)}
                className="hover:text-blue-400 transition-colors duration-200 font-medium py-2"
              >
                Problems
              </Link>
              <Link 
                to="/solutions" 
                onClick={() => setShowMobileMenu(false)}
                className="hover:text-blue-400 transition-colors duration-200 font-medium py-2"
              >
                Solutions
              </Link>
              <Link 
                to="/discuss" 
                onClick={() => setShowMobileMenu(false)}
                className="hover:text-blue-400 transition-colors duration-200 font-medium py-2"
              >
                Discuss
              </Link>
              
              {/* Mobile: Show Create Problem in main menu for admin */}
              {isAdmin && (
                <Link 
                  to="/admin/create-problem" 
                  onClick={() => setShowMobileMenu(false)}
                  className="hover:text-yellow-400 transition-colors duration-200 font-medium py-2 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create Problem (Admin)
                </Link>
              )}
              
              {/* Mobile auth buttons if not logged in */}
              {!isAuthenticated && (
                <div className="pt-4 border-t border-gray-700 space-y-3">
                  <Link 
                    to="/login" 
                    onClick={() => setShowMobileMenu(false)}
                    className="block w-full text-center px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    onClick={() => setShowMobileMenu(false)}
                    className="block w-full text-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;