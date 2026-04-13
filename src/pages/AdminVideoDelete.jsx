import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient'
import { Link } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const AdminVideoDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get(`/problem/viewallproblems?page=${page}`);
      
      // Extract problems from data.data array and pagination info
      const problemsList = data.data || [];
      setProblems(problemsList);
      
      // Update pagination state
      setPagination({
        currentPage: data.page || 1,
        totalPages: data.totalPages || 1,
        totalItems: data.total || 0,
        itemsPerPage: data.count || 10
      });
      
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    
    try {
      await axiosClient.delete(`/video/delete/${id}`);
      // Remove the deleted problem from state
      setProblems(problems.filter(problem => problem._id !== id));
      
      // If we deleted the last item on the page, fetch previous page
      if (problems.length === 1 && pagination.currentPage > 1) {
        fetchProblems(pagination.currentPage - 1);
      }
    } catch (err) {
      setError(err);
      console.error(err);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchProblems(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg my-4">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error.response.data.error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Delete Problems</h1>
        <div className="text-sm text-gray-500">
          Showing {problems.length} of {pagination.totalItems} problems
        </div>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th className="w-1/12">#</th>
              <th className="w-4/12">Title</th>
              <th className="w-2/12">Difficulty</th>
              <th className="w-3/12">Tags</th>
              <th className="w-2/12">Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.length > 0 ? (
              problems.map((problem, index) => {
                const itemNumber = (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1;
                
                return (
                  <tr key={problem._id}>
                    <th>{itemNumber}</th>
                    <td>
                      <div className="font-medium">{problem.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {problem.description}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        problem.difficulty?.toLowerCase() === 'easy' 
                          ? 'badge-success' 
                          : problem.difficulty?.toLowerCase() === 'medium' 
                            ? 'badge-warning' 
                            : 'badge-error'
                      }`}>
                        {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1) || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      {problem.tags ? (
                        <span className="badge badge-outline">
                          {problem.tags}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">No tags</span>
                      )}
                    </td>
                    <td>
  <div className="flex space-x-2">
    <NavLink to={`/video/upload/${problem._id}`}>
      <button
        className="btn bg-blue-600 btn-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Upload
        </button>
    </NavLink>
  </div>
</td>
                    <td>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleDelete(problem._id)}
                          className="btn btn-sm btn-error"
                        >
                          Delete
                        </button>
                      </div>

                    </td>
                  
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-8">
                  <div className="text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No problems found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="btn btn-sm btn-ghost"
          >
            &laquo; Previous
          </button>
          
          <div className="flex space-x-1">
            {[...Array(pagination.totalPages)].map((_, index) => {
              const pageNum = index + 1;
              // Show first page, last page, current page, and pages around current page
              if (
                pageNum === 1 ||
                pageNum === pagination.totalPages ||
                (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`btn btn-sm ${pagination.currentPage === pageNum ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                pageNum === pagination.currentPage - 2 ||
                pageNum === pagination.currentPage + 2
              ) {
                return <span key={pageNum} className="px-2">...</span>;
              }
              return null;
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="btn btn-sm btn-ghost"
          >
            Next &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminVideoDelete;