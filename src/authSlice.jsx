import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient.jsx';

// Helper function to decode JWT token
const decodeJWT = (token) => {
  if (!token) return null;
  
  try {
    // JWT format: header.payload.signature
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Helper to create user object from token
const createUserFromToken = (token) => {
  if (!token) return { token };
  
  const decoded = decodeJWT(token);
  if (!decoded) return { token };
  
  // Extract user info from decoded JWT
  return {
    token,
    id: decoded.id,
    role: decoded.role,
    email: decoded.emailId || decoded.email,
    // You might want to add firstName/lastName from your backend API
    // For now, use email username part as display name
    firstName: decoded.firstName || decoded.emailId?.split('@')[0] || 'User',
  };
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/auth/register', userData);
      console.log('Register response:', response.data);
      
      if (response.data.token) {
        const token = response.data.token;
        localStorage.setItem('authToken', token);
        
        // Create user object from token
        const user = createUserFromToken(token);
        console.log('Created user from token:', user);
        
        return user;
      }
      
      return response.data.user || response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || error.message || 'Registration failed',
        status: error.response?.status,
      });
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        const token = response.data.token;
        localStorage.setItem('authToken', token);
        
        // Create user object from token
        const user = createUserFromToken(token);
        console.log('Created user from token:', user);
        
        return user;
      }
      
      // Fallback if backend returns user object directly
      if (response.data.user) {
        localStorage.setItem('authToken', response.data.user.token);
        return response.data.user;
      }
      
      throw new Error('No token or user data received');
    } catch (error) {
      console.log('Login error:', error.response?.data);
      return rejectWithValue({
        message: error.response?.data?.message || error.message || 'Login failed',
        status: error.response?.status,
      });
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }
      
      // Verify token with backend
      const { data } = await axiosClient.get('/auth/check');
      
      // Create user object from stored token
      const user = createUserFromToken(token);
      console.log('Check auth - created user:', user);
      
      return user;
    } catch (error) {
      // Clear token if auth check fails
      localStorage.removeItem('authToken');
      return rejectWithValue({
        message: error.response?.data?.message || error.message || 'Auth check failed',
        status: error.response?.status,
      });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (error) {
      console.log('Logout API error (continuing anyway):', error.message);
    } finally {
    
      localStorage.removeItem('authToken');
      return null;
    }
  }
);

export const restoreAuth = createAsyncThunk(
  'auth/restore',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }
      
      // Create user object from token (without verifying with backend for speed)
      const user = createUserFromToken(token);
      console.log('Restored user from token:', user);
      
      return user;
    } catch (error) {
      localStorage.removeItem('authToken');
      return rejectWithValue({
        message: 'Session expired',
      });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    initialized: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Add a reducer to manually update user if needed
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Also update localStorage if you store user data there
        localStorage.setItem('userData', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register User Cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        console.log('Register fulfilled, user:', action.payload);
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      })
  
      // Login User Cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('Login fulfilled, user:', action.payload);
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.error = null;
        console.log('isAuthenticated set to:', state.isAuthenticated);
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log('Login rejected');
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      })
  
      // Check Auth Cases
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.error = null;
        state.initialized = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.initialized = true;
      })
      
      // Restore Auth Cases
      .addCase(restoreAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.initialized = true;
        console.log('Auth restored, user:', action.payload);
      })
      .addCase(restoreAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.initialized = true;
      })
  
      // Logout User Cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.user = null;
        state.isAuthenticated = false;
      });
  }
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;