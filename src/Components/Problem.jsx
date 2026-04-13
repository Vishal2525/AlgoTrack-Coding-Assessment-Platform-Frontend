import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router-dom';
import axiosClient from "../utils/axiosClient"
import FlowAi from './FlowAi';
import Editorial from './Editorial';

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [copySuccess, setCopySuccess] = useState({}); // Track copy success per solution
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  let {problemId}  = useParams();
  console.log("Problem ID:", problemId);

  const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/view/${problemId}`);
        console.log('Full response:', response.data);
        
        const problemData = response.data.data || response.data;
        console.log('Problem data:', problemData);
        
        setProblem(problemData);
        
        const initialCode = problemData.startCode?.find((sc) => {
          const lang = sc.language.toLowerCase();
          if (lang === 'c++' && selectedLanguage === 'cpp') return true;
          if (lang === 'java' && selectedLanguage === 'java') return true;
          if (lang === 'javascript' && selectedLanguage === 'javascript') return true;
          return false;
        })?.initialCode || '// Write your code here';

        console.log('Initial code:', initialCode);
        setCode(initialCode);
        setLoading(false);
        
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    if (problemId) {
      fetchProblem();
    }
  }, [problemId, selectedLanguage]);

  useEffect(() => {
    if (problem && problem.startCode) {
      const langCode = problem.startCode.find(sc => {
        const lang = sc.language.toLowerCase();
        if (lang === 'c++' && selectedLanguage === 'cpp') return true;
        if (lang === 'java' && selectedLanguage === 'java') return true;
        if (lang === 'javascript' && selectedLanguage === 'javascript') return true;
        return false;
      });
      
      setCode(langCode?.initialCode || '// Write your code here');
    }
  }, [selectedLanguage, problem]);

  // Handle resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Set boundaries (min 20%, max 80%)
      const clampedWidth = Math.max(20, Math.min(80, newLeftWidth));
      setLeftPanelWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true);
    try {
      console.log(`Fetching submissions for problemId: ${problemId}`);
      const response = await axiosClient.get(`/submission/submittedproblem/${problemId}`);
      console.log('Submissions API response:', response.data);
      
      // Extract submissions from response
      let submissionsData = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        submissionsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        submissionsData = response.data;
      }
      
      console.log('Processed submissions data:', submissionsData);
      setSubmissions(submissionsData);
      
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/runcode/${problemId}`, {
        code,
        language: selectedLanguage
      });

      console.log('Run API Response:', response.data);
      
      const resultData = response.data;
      setRunResult(resultData);
      setLoading(false);
      setActiveRightTab('testcase');
      
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        message: 'Error running code',
        error: error.message || 'Internal server error'
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });

      console.log('Submit API Response:', response.data);
      
      const resultData = response.data;
      setSubmitResult(resultData);
      setLoading(false);
      setActiveRightTab('result');
      
      // Refresh submissions after successful submission
      if (activeLeftTab === 'submissions') {
        fetchSubmissions();
      }
      
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({
        message: 'Error submitting code',
        error: error.message || 'Internal server error'
      });
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  // Function to copy solution code
  const copySolutionCode = (codeToCopy, solutionIndex) => {
    navigator.clipboard.writeText(codeToCopy)
      .then(() => {
        // Show success feedback for this specific solution
        setCopySuccess({...copySuccess, [solutionIndex]: true});
        
        // Reset success message after 2 seconds
        setTimeout(() => {
          setCopySuccess({...copySuccess, [solutionIndex]: false});
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy code: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = codeToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          setCopySuccess({...copySuccess, [solutionIndex]: true});
          setTimeout(() => {
            setCopySuccess({...copySuccess, [solutionIndex]: false});
          }, 2000);
        } catch (err) {
          console.error('Fallback copy failed: ', err);
          alert('Failed to copy code. Please select and copy manually.');
        }
        document.body.removeChild(textArea);
      });
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'cpp';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Helper function to get test results for RUN
  const getTestResults = (result) => {
    if (result.testResults && Array.isArray(result.testResults)) {
      return result.testResults;
    } else if (result.testCases && Array.isArray(result.testCases)) {
      return result.testCases;
    }
    return [];
  };

  // Helper function to check if all tests passed for RUN
  const areAllTestsPassed = (result) => {
    const testResults = getTestResults(result);
    return testResults.every(test => test.status_id === 3);
  };

  // Helper function to get status description
  const getStatusDescription = (statusId) => {
    const statusMap = {
      1: 'In Queue',
      2: 'Processing',
      3: 'Accepted',
      4: 'Wrong Answer',
      5: 'Time Limit Exceeded',
      6: 'Compilation Error',
      7: 'Runtime Error',
      8: 'Memory Limit Exceeded'
    };
    return statusMap[statusId] || 'Unknown';
  };

  // Helper function to get submission status
  const getSubmissionStatus = (status) => {
    const statusMap = {
      'accepted': { 
        text: 'Accepted', 
        color: 'text-green-600', 
        bg: 'bg-green-50', 
        border: 'border-green-200',
        icon: '✅'
      },
      'wrong_answer': { 
        text: 'Wrong Answer', 
        color: 'text-red-600', 
        bg: 'bg-red-50', 
        border: 'border-red-200',
        icon: '❌'
      },
      'time_limit_exceeded': { 
        text: 'Time Limit Exceeded', 
        color: 'text-orange-600', 
        bg: 'bg-orange-50', 
        border: 'border-orange-200',
        icon: '⏱️'
      },
      'compilation_error': { 
        text: 'Compilation Error', 
        color: 'text-red-600', 
        bg: 'bg-red-50', 
        border: 'border-red-200',
        icon: '⚙️'
      },
      'runtime_error': { 
        text: 'Runtime Error', 
        color: 'text-red-600', 
        bg: 'bg-red-50', 
        border: 'border-red-200',
        icon: '🚫'
      },
      'memory_limit_exceeded': { 
        text: 'Memory Limit Exceeded', 
        color: 'text-orange-600', 
        bg: 'bg-orange-50', 
        border: 'border-orange-200',
        icon: '💾'
      },
      'processing': { 
        text: 'Processing', 
        color: 'text-blue-600', 
        bg: 'bg-blue-50', 
        border: 'border-blue-200',
        icon: '⏳'
      },
      'in_queue': { 
        text: 'In Queue', 
        color: 'text-gray-600', 
        bg: 'bg-gray-50', 
        border: 'border-gray-200',
        icon: '📊'
      }
    };
    
    return statusMap[status] || { 
      text: status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown', 
      color: 'text-gray-600', 
      bg: 'bg-gray-50', 
      border: 'border-gray-200',
      icon: '❓'
    };
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Helper function to format time
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return 'N/A';
    if (seconds < 0.001) {
      return `${(seconds * 1000000).toFixed(0)} µs`;
    }
    if (seconds < 1) {
      return `${(seconds * 1000).toFixed(0)} ms`;
    }
    return `${seconds.toFixed(3)} s`;
  };

  // Helper function to format memory
  const formatMemory = (kb) => {
    if (!kb) return 'N/A';
    if (kb < 1024) {
      return `${kb} KB`;
    }
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  // Helper function to get language display name
  const getLanguageDisplayName = (lang) => {
    const langMap = {
      'cpp': 'C++',
      'c++': 'C++',
      'java': 'Java',
      'javascript': 'JavaScript',
      'python': 'Python',
      'python3': 'Python 3'
    };
    return langMap[lang?.toLowerCase()] || lang || 'Unknown';
  };

  // Function to view code of a submission
  const viewSubmissionCode = (submissionCode, language) => {
    if (submissionCode) {
      setCode(submissionCode);
      const langKey = language?.toLowerCase() === 'c++' ? 'cpp' : language?.toLowerCase();
      setSelectedLanguage(langKey || 'cpp');
      setActiveRightTab('code');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  // Handle tab click for submissions
  const handleSubmissionsTabClick = () => {
    setActiveLeftTab('submissions');
    fetchSubmissions();
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Problem not found</h2>
          <p className="text-gray-500">The problem you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-screen flex bg-base-100 relative select-none"
    >
      {/* Left Panel */}
      <div 
        className="flex flex-col border-r border-base-300"
        style={{ width: `${leftPanelWidth}%` }}
      >
        {/* Left Tabs */}
        <div className="tabs tabs-bordered bg-base-200 px-4">
          <button 
            className={`tab ${activeLeftTab === 'description' ? 'tab-active' : ''}`}
            onClick={() => setActiveLeftTab('description')}
          >
            Description
          </button>
          <button 
            className={`tab ${activeLeftTab === 'editorial' ? 'tab-active' : ''}`}
            onClick={() => setActiveLeftTab('editorial')}
          >
            Editorial
          </button>
          <button 
            className={`tab ${activeLeftTab === 'solutions' ? 'tab-active' : ''}`}
            onClick={() => setActiveLeftTab('solutions')}
          >
            Solutions
          </button>
          <button 
            className={`tab ${activeLeftTab === 'submissions' ? 'tab-active' : ''}`}
            onClick={handleSubmissionsTabClick}
          >
            Submissions
          </button>
           <button 
            className={`tab ${activeLeftTab === 'FlowAi' ? 'tab-active' : ''}`}
            onClick={() => setActiveLeftTab('FlowAi')}
          >
            FlowAI
          </button>
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeLeftTab === 'description' && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold">{problem.title}</h1>
                <div className={`badge badge-outline ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                </div>
                {problem.tags && (
                  <div className="badge badge-primary">{problem.tags}</div>
                )}
              </div>

              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {problem.description}
                </div>
              </div>

              {problem.visibleTestCases && problem.visibleTestCases.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Examples:</h3>
                  <div className="space-y-4">
                    {problem.visibleTestCases.map((example, index) => (
                      <div key={index} className="bg-base-200 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Example {index + 1}:</h4>
                        <div className="space-y-2 text-sm font-mono">
                          <div><strong>Input:</strong> <pre className="inline">{example.input}</pre></div>
                          <div><strong>Output:</strong> <pre className="inline">{example.output}</pre></div>
                          {example.explanation && (
                            <div><strong>Explanation:</strong> {example.explanation}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeLeftTab === 'editorial' && (
            <div className="prose max-w-none">
              <h2 className="text-xl font-bold mb-4">Editorial</h2>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}/>
              </div>
            </div>
          )}

      {activeLeftTab === 'FlowAi' && (
  <div className="prose max-w-none h-full">
    <h2 className="text-xl font-bold mb-4">Chat with AI Assistant</h2>
    <div className="h-[calc(100%-3rem)]">
      <FlowAi problem={{
        title: problem?.title || "",
        description: problem?.description || "",
        // Use visibleTestCases if available, otherwise empty array
        visibleTestCases: problem?.visibleTestCases || problem?.testCases || [],
        // Get start code for current selected language
        startCode: (() => {
          if (!problem?.startCode) return "";
          const langCode = problem.startCode.find(sc => {
            const lang = sc.language.toLowerCase();
            if (lang === 'c++' && selectedLanguage === 'cpp') return true;
            if (lang === 'java' && selectedLanguage === 'java') return true;
            if (lang === 'javascript' && selectedLanguage === 'javascript') return true;
            return false;
          });
          return langCode?.initialCode || problem.startCode[0]?.initialCode || "";
        })()
      }} />
    </div>
  </div>
)}

          {activeLeftTab === 'solutions' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Solutions</h2>
              <div className="space-y-6">
                {problem.referenceSolution && problem.referenceSolution.length > 0 ? (
                  problem.referenceSolution.map((solution, index) => (
                    <div key={index} className="border border-base-300 rounded-lg overflow-hidden">
                      {/* Solution Header with Copy Button */}
                      <div className="bg-base-200 px-4 py-3 flex justify-between items-center">
                        <h3 className="font-semibold">{problem?.title} - {solution?.language}</h3>
                        <div className="flex items-center gap-2">
                          {copySuccess[index] && (
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                              Copied!
                            </span>
                          )}
                          <button
                            onClick={() => copySolutionCode(solution?.completeCode, index)}
                            className="btn btn-sm btn-ghost hover:btn-primary"
                            title="Copy code"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Code
                          </button>
                        </div>
                      </div>
                      
                      {/* Solution Code */}
                      <div className="relative">
                        <pre className="bg-base-300 p-4 rounded-b text-sm overflow-x-auto font-mono whitespace-pre-wrap">
                          <code>{solution?.completeCode}</code>
                        </pre>
                        
                        {/* Copy button overlay (optional alternative) */}
                        <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copySolutionCode(solution?.completeCode, index)}
                            className="btn btn-xs btn-primary"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Solutions Available</h3>
                    <p className="text-gray-500">Solutions will be available after you solve the problem.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeLeftTab === 'submissions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">My Submissions</h2>
                <div className="flex gap-2">
                  <div className="text-sm text-gray-500">
                    {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                  </div>
                  <button 
                    className="btn btn-sm btn-ghost"
                    onClick={fetchSubmissions}
                    disabled={submissionsLoading}
                  >
                    {submissionsLoading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {submissionsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="text-center">
                    <span className="loading loading-spinner loading-lg"></span>
                    <p className="mt-2 text-gray-500">Loading submissions...</p>
                  </div>
                </div>
              ) : submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((submission, index) => {
                    const statusInfo = getSubmissionStatus(submission.status);
                    const languageDisplay = getLanguageDisplayName(submission.language);
                    
                    return (
                      <div 
                        key={submission._id || index} 
                        className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${statusInfo.bg} ${statusInfo.border} hover:scale-[1.01] transition-transform duration-200`}
                        onClick={() => viewSubmissionCode(submission.code, submission.language)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{statusInfo.icon}</span>
                            <div>
                              <div className={`font-semibold ${statusInfo.color}`}>
                                {statusInfo.text}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDate(submission.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-700">
                              {languageDisplay}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              ID: {submission._id?.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                        
                        {/* Performance Metrics */}
                        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                          <div className="text-center">
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Runtime</div>
                            <div className="font-semibold text-sm mt-1 text-blue-600">
                              {formatTime(submission.runtime)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Memory</div>
                            <div className="font-semibold text-sm mt-1 text-purple-600">
                              {formatMemory(submission.memory)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Test Cases</div>
                            <div className="font-semibold text-sm mt-1">
                              <span className={submission.testCasesPassed === submission.totalTestCases ? 'text-green-600' : 'text-red-600'}>
                                {submission.testCasesPassed || 0}/{submission.totalTestCases || 0}
                              </span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Click to View</div>
                            <div className="font-semibold text-sm mt-1 text-blue-600">
                              View Code →
                            </div>
                          </div>
                        </div>
                        
                        {/* Error Message (if any) */}
                        {submission.errorMessage && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded text-sm">
                            <div className="font-semibold text-red-700 flex items-center gap-2 mb-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Error Details
                            </div>
                            <div className="font-mono text-red-600 text-xs whitespace-pre-wrap overflow-x-auto">
                              {submission.errorMessage}
                            </div>
                          </div>
                        )}
                        
                        {/* Code Preview (First 2 lines) */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-xs text-gray-500 mb-2">Code Preview:</div>
                          <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto font-mono">
                            {submission.code?.split('\n').slice(0, 2).join('\n') || 'No code available'}
                            {submission.code?.split('\n').length > 2 && (
                              <span className="text-gray-400"> ...</span>
                            )}
                          </pre>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Submissions Yet</h3>
                  <p className="text-gray-500 mb-4">Submit your solution to see it here!</p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setActiveLeftTab('description');
                      setActiveRightTab('code');
                    }}
                  >
                    Start Solving
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className={`w-2 bg-base-300 hover:bg-primary cursor-col-resize flex items-center justify-center relative ${
          isResizing ? 'bg-primary' : ''
        }`}
        onMouseDown={() => setIsResizing(true)}
      >
        <div className="flex flex-col items-center">
          <div className="w-1 h-1 bg-gray-400 rounded-full my-1"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full my-1"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full my-1"></div>
        </div>
        <div className="absolute inset-0 hover:bg-primary/20 transition-colors"></div>
      </div>

      {/* Right Panel */}
      <div 
        className="flex flex-col"
        style={{ width: `${100 - leftPanelWidth}%` }}
      >
        {/* Right Tabs */}
        <div className="tabs tabs-bordered bg-base-200 px-4">
          <button 
            className={`tab ${activeRightTab === 'code' ? 'tab-active' : ''}`}
            onClick={() => setActiveRightTab('code')}
          >
            Code
          </button>
          <button 
            className={`tab ${activeRightTab === 'testcase' ? 'tab-active' : ''}`}
            onClick={() => setActiveRightTab('testcase')}
          >
            Testcase
          </button>
          <button 
            className={`tab ${activeRightTab === 'result' ? 'tab-active' : ''}`}
            onClick={() => setActiveRightTab('result')}
          >
            Result
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col">
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col">
              {/* Language Selector */}
              <div className="flex justify-between items-center p-4 border-b border-base-300">
                <div className="flex gap-2">
                  {problem.startCode && problem.startCode.map((sc) => {
                    const lang = sc.language.toLowerCase();
                    const langKey = lang === 'c++' ? 'cpp' : lang;
                    const displayName = lang === 'c++' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1);
                    
                    return (
                      <button
                        key={langKey}
                        className={`btn btn-sm ${selectedLanguage === langKey ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => handleLanguageChange(langKey)}
                      >
                        {displayName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-base-300 flex justify-between">
                <div className="flex gap-2">
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => setActiveRightTab('testcase')}
                  >
                    Console
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`btn btn-outline btn-sm ${loading ? 'loading' : ''}`}
                    onClick={handleRun}
                    disabled={loading}
                  >
                    Run
                  </button>
                  <button
                    className={`btn btn-primary btn-sm ${loading ? 'loading' : ''}`}
                    onClick={handleSubmitCode}
                    disabled={loading}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Test Results</h3>
              {runResult ? (
                <div className={`alert ${areAllTestsPassed(runResult) ? 'alert-success' : 'alert-error'} mb-4`}>
                  <div>
                    {areAllTestsPassed(runResult) ? (
                      <div>
                        <h4 className="font-bold">✅ All test cases passed!</h4>
                        <p className="text-sm mt-2">Message: {runResult.message}</p>
                        
                        <div className="mt-4 space-y-2">
                          {getTestResults(runResult).map((tc, i) => (
                            <div key={i} className="bg-base-100 p-3 rounded text-xs">
                              <div className="font-mono">
                                <div><strong>Input:</strong> <pre className="inline">{tc.stdin}</pre></div>
                                <div><strong>Expected:</strong> <pre className="inline">{tc.expected_output}</pre></div>
                                <div><strong>Output:</strong> <pre className="inline">{tc.stdout}</pre></div>
                                <div><strong>Status:</strong> {getStatusDescription(tc.status_id)}</div>
                                <div className={tc.status_id === 3 ? 'text-green-600' : 'text-red-600'}>
                                  {tc.status_id === 3 ? '✓ Passed' : '✗ Failed'}
                                </div>
                                {tc.time && <div><strong>Time:</strong> {formatTime(tc.time)}</div>}
                                {tc.memory && <div><strong>Memory:</strong> {formatMemory(tc.memory)}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold">❌ Some test cases failed</h4>
                        <p className="text-sm">Message: {runResult.message}</p>
                        <div className="mt-4 space-y-2">
                          {getTestResults(runResult).map((tc, i) => (
                            <div key={i} className="bg-base-100 p-3 rounded text-xs">
                              <div className="font-mono">
                                <div><strong>Input:</strong> <pre className="inline">{tc.stdin}</pre></div>
                                <div><strong>Expected:</strong> <pre className="inline">{tc.expected_output}</pre></div>
                                <div><strong>Output:</strong> <pre className="inline">{tc.stdout}</pre></div>
                                <div><strong>Status:</strong> {getStatusDescription(tc.status_id)}</div>
                                <div className={tc.status_id === 3 ? 'text-green-600' : 'text-red-600'}>
                                  {tc.status_id === 3 ? '✓ Passed' : '✗ Failed'}
                                </div>
                                {tc.time && <div><strong>Time:</strong> {formatTime(tc.time)}</div>}
                                {tc.memory && <div><strong>Memory:</strong> {formatMemory(tc.memory)}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  Click "Run" to test your code with the example test cases.
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Submission Result</h3>
              {submitResult ? (
                <div className={`alert ${submitResult.submission?.status === 'accepted' ? 'alert-success' : 'alert-error'}`}>
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        {submitResult.submission?.status === 'accepted' ? (
                          <div>
                            <h4 className="font-bold text-xl text-green-600">🎉 Accepted</h4>
                            <p className="text-sm mt-1 text-green-700">{submitResult.message}</p>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-bold text-xl text-red-600">
                              ❌ {submitResult.submission?.status?.charAt(0).toUpperCase() + submitResult.submission?.status?.slice(1) || 'Error'}
                            </h4>
                            <p className="text-sm mt-1 text-red-700">{submitResult.message}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Submission Details Card */}
                      <div className="bg-base-100 border border-base-300 rounded-lg p-4 min-w-48">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="font-semibold">Test Cases:</div>
                          <div className="text-right">
                            {submitResult.submission?.testCasesPassed || 0}/{submitResult.submission?.totalTestCases || 0}
                          </div>
                          
                          <div className="font-semibold">Runtime:</div>
                          <div className="text-right">
                            {formatTime(submitResult.submission?.runtime || 0)}
                          </div>
                          
                          <div className="font-semibold">Memory:</div>
                          <div className="text-right">
                            {formatMemory(submitResult.submission?.memory || 0)}
                          </div>
                          
                          <div className="font-semibold">Language:</div>
                          <div className="text-right">
                            {submitResult.submission?.language?.toUpperCase() || 'N/A'}
                          </div>
                          
                          <div className="font-semibold">Submitted:</div>
                          <div className="text-right text-xs">
                            {submitResult.submission?.createdAt ? 
                              new Date(submitResult.submission.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                              'Just now'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Test Cases Breakdown */}
                    <div className="mt-6">
                      <h5 className="font-semibold mb-2">Test Cases Breakdown:</h5>
                      <div className="space-y-3">
                        {/* Passed Test Cases */}
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">Passed</div>
                            <div className="text-sm text-gray-600">
                              {submitResult.submission?.testCasesPassed || 0} out of {submitResult.submission?.totalTestCases || 0} test cases
                            </div>
                          </div>
                        </div>
                        
                        {/* Failed Test Cases */}
                        {submitResult.submission?.status !== 'accepted' && (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium">Failed</div>
                              <div className="text-sm text-gray-600">
                                {((submitResult.submission?.totalTestCases || 0) - (submitResult.submission?.testCasesPassed || 0))} test cases
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Error Message if any */}
                        {submitResult.submission?.errorMessage && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                            <div className="font-semibold text-red-700 mb-1">Error Details:</div>
                            <div className="text-sm font-mono text-red-600 whitespace-pre-wrap">
                              {submitResult.submission.errorMessage}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-3">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          navigator.clipboard.writeText(code);
                          // You can add a toast notification here
                        }}
                      >
                        Copy Code
                      </button>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => setActiveRightTab('testcase')}
                      >
                        View Test Cases
                      </button>
                      {submitResult.submission?.status !== 'accepted' && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => setActiveRightTab('code')}
                        >
                          Try Again
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  Click "Submit" to submit your solution for evaluation.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;