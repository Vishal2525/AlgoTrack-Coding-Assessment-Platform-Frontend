import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// // Response interceptor to handle CORS errors
// axiosClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle CORS/Network errors
//     if (error.code === 'ERR_NETWORK' || !error.response) {
//       const corsError = new Error(
//         'Cannot connect to server. Check if backend is running and CORS is configured.'
//       );
//       corsError.name = 'NetworkError';
//       corsError.isNetworkError = true;
//       throw corsError;
//     }
    
//     // Handle other errors
//     if (error.response?.status === 401) {
//       // Handle unauthorized
//       localStorage.removeItem('token');
//     }
    
//     // Re-throw with serializable data
//     const serializableError = {
//       message: error.response?.data?.message || error.message,
//       status: error.response?.status,
//       data: error.response?.data,
//     };
    
//     throw serializableError;
//   }
// );

export default axiosClient;