import { useEffect, useState } from 'react';
import { NavLink } from 'react-router'; 
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from "../utils/axiosClient.jsx";
import { logoutUser } from '../authSlice.jsx';

const Allproblem = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    count: 0,
    page: 1,
    totalPages: 1
  });
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all' 
  });
  
  // Current page state
  const [currentPage, setCurrentPage] = useState(1);
  const [problemsPerPage] = useState(10);

  const fetchProblems = async (page = 1) => {
    try {
      setLoading(true);
      // Add pagination parameters to API call
      const response = await axiosClient.get(`/problem/viewallproblems?page=${page}&limit=${problemsPerPage}`);
      console.log('API Response for page', page, ':', response.data);
  
      const apiData = response.data;
      
      if (apiData.success && apiData.data) {
        setProblems(apiData.data); 
        setStats({
          total: apiData.total || 0,
          count: apiData.count || 0,
          page: apiData.page || 1,
          totalPages: apiData.totalPages || 1
        });
      } else {
        setError('Invalid response format from server');
        setProblems([]);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
      setError('Failed to fetch problems');
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems(currentPage);

    const fetchSolvedProblems = async () => {
      if (!user) {
        setSolvedProblems([]);
        return;
      }
      
      try {
        const response = await axiosClient.get('/submission/getallproblemsolved');
        console.log('Solved problems response:', response);
        
        const apiData = response.data;
        if (apiData.success && apiData.data) {
          setSolvedProblems(apiData.data);
        } else if (Array.isArray(apiData)) {
          setSolvedProblems(apiData);
        } else {
          setSolvedProblems(apiData?.data || []);
        }
      } catch (error) {
        console.error('Error fetching solved problems:', error);
        setSolvedProblems([]);
      }
    };

    fetchSolvedProblems();
  }, [user, currentPage]); // Add currentPage to dependencies

  // Filter problems based on filters (client-side filtering for now)
  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    
    let statusMatch = true;
    if (filters.status === 'solved') {
      statusMatch = solvedProblems.some(solvedProblem => {
        return solvedProblem.problemId === problem._id || solvedProblem._id === problem._id;
      });
    }
    
    return difficultyMatch && tagMatch && statusMatch;
  });

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > stats.totalPages) return;
    setCurrentPage(pageNumber);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5;
    
    if (stats.totalPages <= maxPageButtons) {
      for (let i = 1; i <= stats.totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
      let endPage = startPage + maxPageButtons - 1;
      
      if (endPage > stats.totalPages) {
        endPage = stats.totalPages;
        startPage = Math.max(1, endPage - maxPageButtons + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading problems...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="alert alert-error max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Main Content */}
      <div className="container mx-auto p-4 md:p-6">
        {/* Statistics Banner */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm opacity-90">Total Problems</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{filteredProblems.length}</div>
              <div className="text-sm opacity-90">Showing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{solvedProblems.length}</div>
              <div className="text-sm opacity-90">You Solved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{currentPage}</div>
              <div className="text-sm opacity-90">Current Page</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.totalPages}</div>
              <div className="text-sm opacity-90">Total Pages</div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="card bg-base-100 shadow-lg mb-8">
          <div className="card-body">
            <h2 className="card-title mb-4">Filter Problems</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Status</span>
                </label>
                <select 
                  className="select select-bordered w-full"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="all">All Problems</option>
                  <option value="solved">Solved Only</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Difficulty</span>
                </label>
                <select 
                  className="select select-bordered w-full"
                  value={filters.difficulty}
                  onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tag</span>
                </label>
                <select 
                  className="select select-bordered w-full"
                  value={filters.tag}
                  onChange={(e) => setFilters({...filters, tag: e.target.value})}
                >
                  <option value="all">All Tags</option>
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">DP</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="space-y-4 mb-8">
          {filteredProblems.length === 0 ? (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold mb-2">No Problems Found</h3>
                  <p className="text-gray-600">Try changing your filter criteria</p>
                </div>
              </div>
            </div>
          ) : (
            filteredProblems.map((problem, index) => {
              const globalIndex = (currentPage - 1) * problemsPerPage + index;
              const isSolved = solvedProblems.some(
                solvedProblem => solvedProblem.problemId === problem._id || solvedProblem._id === problem._id
              );
              
              return (
                <div key={problem._id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="card-body">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isSolved ? 'bg-success text-success-content' : 'bg-base-300'}`}>
                            {isSolved ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span className="font-bold">{globalIndex + 1}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                              <NavLink to={`/problem/${problem._id}`}>
                                {problem.title}
                              </NavLink>
                            </h3>
                            {isSolved && (
                              <span className="badge badge-success badge-sm">Solved</span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                            {problem.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            <span className={`badge ${getDifficultyBadgeColor(problem.difficulty)} gap-1`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {problem.difficulty}
                            </span>
                            <span className="badge badge-info gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {problem.tags}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <NavLink 
                          to={`/problem/${problem._id}`} 
                          className="btn btn-primary btn-sm md:btn-md"
                        >
                          {isSolved ? 'View Solution' : 'Solve Problem'}
                        </NavLink>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination - SHOW ONLY IF TOTAL PAGES > 1 */}
        {stats.totalPages > 1 && (
          <div className="card bg-base-100 shadow-lg mt-8">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Page Info */}
                <div className="text-sm text-gray-600">
                  Page <span className="font-semibold">{currentPage}</span> of{' '}
                  <span className="font-semibold">{stats.totalPages}</span>
                  {' '}(Total: {stats.total} problems)
                </div>

                {/* Pagination Controls */}
                <div className="join">
                  {/* Previous Button */}
                  <button
                    className="join-item btn btn-sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    « Previous
                  </button>

                  {/* Page Numbers - Show only if not too many */}
                  {stats.totalPages <= 7 ? (
                    // Show all page numbers if 7 or less
                    Array.from({ length: stats.totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        className={`join-item btn btn-sm ${currentPage === number ? 'btn-active btn-primary' : ''}`}
                        onClick={() => handlePageChange(number)}
                      >
                        {number}
                      </button>
                    ))
                  ) : (
                    // Show limited page numbers with ellipsis
                    <>
                      {currentPage > 3 && (
                        <>
                          <button
                            className="join-item btn btn-sm"
                            onClick={() => handlePageChange(1)}
                          >
                            1
                          </button>
                          {currentPage > 4 && (
                            <button className="join-item btn btn-sm btn-disabled">...</button>
                          )}
                        </>
                      )}

                      {/* Show current page and neighbors */}
                      {[currentPage - 1, currentPage, currentPage + 1]
                        .filter(num => num >= 1 && num <= stats.totalPages)
                        .map((number) => (
                          <button
                            key={number}
                            className={`join-item btn btn-sm ${currentPage === number ? 'btn-active btn-primary' : ''}`}
                            onClick={() => handlePageChange(number)}
                          >
                            {number}
                          </button>
                        ))}

                      {currentPage < stats.totalPages - 2 && (
                        <>
                          {currentPage < stats.totalPages - 3 && (
                            <button className="join-item btn btn-sm btn-disabled">...</button>
                          )}
                          <button
                            className="join-item btn btn-sm"
                            onClick={() => handlePageChange(stats.totalPages)}
                          >
                            {stats.totalPages}
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {/* Next Button */}
                  <button
                    className="join-item btn btn-sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === stats.totalPages}
                  >
                    Next »
                  </button>
                </div>

                {/* Page Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Go to:</span>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max={stats.totalPages}
                      className="input input-bordered input-sm w-16"
                      value={currentPage}
                      onChange={(e) => {
                        const page = parseInt(e.target.value);
                        if (!isNaN(page) && page >= 1 && page <= stats.totalPages) {
                          setCurrentPage(page);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handlePageChange(currentPage);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'hard': return 'badge-error';
    default: return 'badge-neutral';
  }
};

export default Allproblem;