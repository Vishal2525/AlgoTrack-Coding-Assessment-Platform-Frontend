
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCode, 
  FaFire, 
  FaChartLine, 
  FaUsers, 
  FaTrophy, 
  FaBook, 
  FaLaptopCode,
  FaCheckCircle,
  FaStar,
  FaHeart,
  FaBolt,
  FaLightbulb,
  FaPlay,
  FaClock,
  FaSearch,
  FaFilter
} from 'react-icons/fa';
import { SiLeetcode } from 'react-icons/si';

const Homepage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const problems = [
    { id: 1, title: 'Two Sum', difficulty: 'Easy', category: 'Array', solved: true, likes: 4500, submissions: 2500000, premium: false, acceptance: '50%' },
    { id: 2, title: 'Reverse Linked List', difficulty: 'Easy', category: 'Linked List', solved: false, likes: 3200, submissions: 1800000, premium: false, acceptance: '65%' },
    { id: 3, title: 'Merge Intervals', difficulty: 'Medium', category: 'Array', solved: true, likes: 5800, submissions: 1500000, premium: true, acceptance: '42%' },
    { id: 4, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', category: 'String', solved: false, likes: 6200, submissions: 2200000, premium: false, acceptance: '33%' },
    { id: 5, title: 'Trapping Rain Water', difficulty: 'Hard', category: 'Array', solved: false, likes: 8900, submissions: 900000, premium: false, acceptance: '28%' },
    { id: 6, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', category: 'Binary Search', solved: false, likes: 7600, submissions: 1200000, premium: true, acceptance: '35%' },
    { id: 7, title: 'Valid Parentheses', difficulty: 'Easy', category: 'Stack', solved: true, likes: 4100, submissions: 3000000, premium: false, acceptance: '72%' },
    { id: 8, title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', category: 'Tree', solved: false, likes: 5300, submissions: 1400000, premium: false, acceptance: '55%' },
  ];

  const categories = ['All', 'Array', 'String', 'Linked List', 'Tree', 'Dynamic Programming', 'Backtracking', 'Graph'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty === difficultyFilter;
    const matchesCategory = activeTab === 'all' || problem.category === activeTab;
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-success';
      case 'Medium': return 'text-warning';
      case 'Hard': return 'text-error';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
  

      {/* Hero Section */}
      <div className="hero bg-gradient-to-r from-primary to-secondary text-primary-content min-h-[500px]">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-6">
              Master Your Coding Skills
              <span className="block text-3xl mt-2">Like Never Before</span>
            </h1>
            <p className="text-xl mb-8">
              Join over 10 million developers practicing coding problems, 
              preparing for interviews, and leveling up their skills
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn btn-accent btn-lg">
                <FaPlay className="mr-2" /> Start Practicing
              </Link>
              <button className="btn btn-outline btn-primary btn-lg">
                <FaChartLine className="mr-2" /> View Contests
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats shadow-lg w-full flex flex-wrap justify-center gap-4 -mt-10 z-10 relative mx-4">
        <div className="stat">
          <div className="stat-figure text-primary">
            <FaCode className="text-3xl" />
          </div>
          <div className="stat-title">Problems Solved</div>
          <div className="stat-value text-primary">2.5M+</div>
          <div className="stat-desc">Daily submissions</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-secondary">
            <FaUsers className="text-3xl" />
          </div>
          <div className="stat-title">Active Users</div>
          <div className="stat-value text-secondary">10M+</div>
          <div className="stat-desc">Worldwide community</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-accent">
            <FaTrophy className="text-3xl" />
          </div>
          <div className="stat-title">Success Rate</div>
          <div className="stat-value text-accent">85%</div>
          <div className="stat-desc">Interview preparation</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-warning">
            <FaBook className="text-3xl" />
          </div>
          <div className="stat-title">Topics Covered</div>
          <div className="stat-value text-warning">50+</div>
          <div className="stat-desc">Comprehensive curriculum</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Featured Problems Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Problems</h2>
              <p className="text-base-content/70">Practice problems to improve your coding skills</p>
            </div>
            <div className="flex gap-4">
              <div className="form-control">
                <div className="input-group">
                  <input 
                    type="text" 
                    placeholder="Search problems..." 
                    className="input input-bordered"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="btn">
                    <FaSearch />
                  </button>
                </div>
              </div>
              <select 
                className="select select-bordered"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff.toLowerCase()}>{diff}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="tabs tabs-boxed bg-base-200 p-2 mb-6">
            {categories.map(category => (
              <a 
                key={category}
                className={`tab ${activeTab === category.toLowerCase() ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(category === 'All' ? 'all' : category)}
              >
                {category}
              </a>
            ))}
          </div>

          {/* Problems Table */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr className="bg-base-200">
                      <th className="w-16 text-center">Status</th>
                      <th>Title</th>
                      <th className="w-32">Difficulty</th>
                      <th className="w-32">Category</th>
                      <th className="w-32">Acceptance</th>
                      <th className="w-24">Likes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProblems.map(problem => (
                      <tr key={problem.id} className="hover:bg-base-200 cursor-pointer">
                        <td className="text-center">
                          {problem.solved ? (
                            <FaCheckCircle className="text-success mx-auto" />
                          ) : (
                            <div className="h-6 w-6"></div>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center">
                            <span className="font-semibold">{problem.title}</span>
                            {problem.premium && (
                              <span className="badge badge-primary badge-sm ml-2">Premium</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`font-bold ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-outline">{problem.category}</span>
                        </td>
                        <td>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-success h-2 rounded-full" 
                                style={{ width: problem.acceptance }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm">{problem.acceptance}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center">
                            <FaHeart className="text-error mr-1" />
                            <span>{problem.likes.toLocaleString()}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-xl">
            <div className="card-body">
              <FaLaptopCode className="text-4xl mb-4" />
              <h3 className="card-title">Interactive IDE</h3>
              <p>Code, run, and debug in our built-in IDE with real-time feedback</p>
            </div>
          </div>
          
          <div className="card bg-gradient-to-br from-accent to-info text-accent-content shadow-xl">
            <div className="card-body">
              <FaFire className="text-4xl mb-4" />
              <h3 className="card-title">Daily Challenges</h3>
              <p>New problems every day to keep your skills sharp</p>
            </div>
          </div>
          
          <div className="card bg-gradient-to-br from-success to-emerald-500 text-success-content shadow-xl">
            <div className="card-body">
              <FaBolt className="text-4xl mb-4" />
              <h3 className="card-title">Fast Execution</h3>
              <p>Quick results with our optimized code execution environment</p>
            </div>
          </div>
          
          <div className="card bg-gradient-to-br from-warning to-orange-500 text-warning-content shadow-xl">
            <div className="card-body">
              <FaLightbulb className="text-4xl mb-4" />
              <h3 className="card-title">Detailed Solutions</h3>
              <p>Learn from multiple approaches and optimized solutions</p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="card bg-base-100 shadow-xl mb-12">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-8 text-center">How It Works</h2>
            <div className="steps steps-vertical lg:steps-horizontal">
              <div className="step step-primary">
                <div className="step-circle">1</div>
                <div className="step-content">
                  <h3 className="font-bold">Choose a Problem</h3>
                  <p>Select from 2000+ coding problems</p>
                </div>
              </div>
              <div className="step step-primary">
                <div className="step-circle">2</div>
                <div className="step-content">
                  <h3 className="font-bold">Write Your Code</h3>
                  <p>Use our built-in IDE with syntax highlighting</p>
                </div>
              </div>
              <div className="step step-primary">
                <div className="step-circle">3</div>
                <div className="step-content">
                  <h3 className="font-bold">Run & Test</h3>
                  <p>Test with custom inputs and edge cases</p>
                </div>
              </div>
              <div className="step step-primary">
                <div className="step-circle">4</div>
                <div className="step-content">
                  <h3 className="font-bold">Submit & Learn</h3>
                  <p>Compare with optimal solutions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="hero bg-gradient-to-r from-base-200 to-base-300 rounded-2xl p-8">
          <div className="hero-content text-center">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold mb-6">Ready to Level Up Your Coding Skills?</h2>
              <p className="text-lg mb-8">
                Join thousands of developers who have improved their coding skills 
                and landed their dream jobs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Get Started Free
                </Link>
                <button className="btn btn-outline btn-lg">
                  View All Problems
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer p-10 bg-base-200 text-base-content">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <SiLeetcode className="text-3xl text-primary" />
            <span className="text-xl font-bold">CodeMaster</span>
          </div>
          <p>Master coding interviews with our comprehensive platform</p>
        </div> 
        <div>
          <span className="footer-title">Platform</span> 
          <a className="link link-hover">Problems</a> 
          <a className="link link-hover">Contests</a> 
          <a className="link link-hover">Discuss</a> 
          <a className="link link-hover">Interview Prep</a>
        </div> 
        <div>
          <span className="footer-title">Company</span> 
          <a className="link link-hover">About us</a> 
          <a className="link link-hover">Contact</a> 
          <a className="link link-hover">Jobs</a> 
          <a className="link link-hover">Press kit</a>
        </div> 
        <div>
          <span className="footer-title">Legal</span> 
          <a className="link link-hover">Terms of use</a> 
          <a className="link link-hover">Privacy policy</a> 
          <a className="link link-hover">Cookie policy</a>
        </div>
      </footer>
      
      <footer className="footer px-10 py-4 border-t bg-base-200 text-base-content border-base-300">
        <div className="items-center grid-flow-col">
          <p>© 2024 CodeMaster. All rights reserved.</p>
        </div> 
        <div className="md:place-self-center md:justify-self-end">
          <div className="grid grid-flow-col gap-4">
            <a><FaCode className="text-xl" /></a>
            <a><FaHeart className="text-xl" /></a>
            <a><FaStar className="text-xl" /></a>
            <a><FaBolt className="text-xl" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;