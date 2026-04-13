import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { Plus, Trash2, Code, FileText, Zap, Tag } from 'lucide-react';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminPanel() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      visibleTestCases: [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: [{ input: '', output: '' }],
      startCode: [
        { 
          language: 'C++', 
          initialCode: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Your solution here\n};`
        },
        { 
          language: 'Java', 
          initialCode: `import java.util.*;\n\nclass Solution {\n    // Your solution here\n}`
        },
        { 
          language: 'JavaScript', 
          initialCode: `// Your solution here\nfunction solve() {\n    // Implementation\n}`
        }
      ],
      referenceSolution: [
        { 
          language: 'C++', 
          completeCode: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Complete solution with comments\n};`
        },
        { 
          language: 'Java', 
          completeCode: `import java.util.*;\n\nclass Solution {\n    // Complete solution with comments\n}`
        },
        { 
          language: 'JavaScript', 
          completeCode: `// Complete solution with comments\nfunction solve() {\n    // Implementation with explanation\n}`
        }
      ]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await axiosClient.post('/problem/createProblem', data);
      alert('Problem created successfully!');
      navigate('/');
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Problem
          </h1>
          <p className="text-gray-600 text-lg">
            Design professional coding challenges for your platform
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transition-transform hover:shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Problem Details</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Title
                </label>
                <input
                  {...register('title')}
                  placeholder="e.g., Two Sum, Reverse Linked List"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.title ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Describe the problem, constraints, and examples..."
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[150px] ${
                    errors.description ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    Difficulty Level
                  </label>
                  <select
                    {...register('difficulty')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="easy" className="text-green-600">Easy</option>
                    <option value="medium" className="text-yellow-600">Medium</option>
                    <option value="hard" className="text-red-600">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    Problem Category
                  </label>
                  <select
                    {...register('tags')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="array">Array</option>
                    <option value="linkedList">Linked List</option>
                    <option value="graph">Graph</option>
                    <option value="dp">Dynamic Programming</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Test Cases */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transition-transform hover:shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-50 rounded-lg">
                <div className="w-5 h-5 bg-green-600 rounded"></div>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Test Cases</h2>
            </div>

            {/* Visible Test Cases */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Visible Test Cases</h3>
                  <p className="text-sm text-gray-500">Shown to users for understanding</p>
                </div>
                <button
                  type="button"
                  onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Case
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {visibleFields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-600">Test Case</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVisible(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <input
                          {...register(`visibleTestCases.${index}.input`)}
                          placeholder="Input"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                      </div>
                      
                      <div>
                        <input
                          {...register(`visibleTestCases.${index}.output`)}
                          placeholder="Expected Output"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                      </div>
                      
                      <div>
                        <textarea
                          {...register(`visibleTestCases.${index}.explanation`)}
                          placeholder="Explanation"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm min-h-[60px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden Test Cases */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Hidden Test Cases</h3>
                  <p className="text-sm text-gray-500">Used for evaluation only</p>
                </div>
                <button
                  type="button"
                  onClick={() => appendHidden({ input: '', output: '' })}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Hidden
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {hiddenFields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
                          H{index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-600">Hidden Case</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeHidden(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <textarea
                          {...register(`hiddenTestCases.${index}.input`)}
                          placeholder="Hidden Input"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm min-h-[80px]"
                        />
                      </div>
                      
                      <div>
                        <textarea
                          {...register(`hiddenTestCases.${index}.output`)}
                          placeholder="Expected Output"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Code Templates */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transition-transform hover:shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Code className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Code Templates</h2>
            </div>
            
            <div className="space-y-6">
              {['C++', 'Java', 'JavaScript'].map((language, index) => (
                <div key={language} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-all">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{language}</h3>
                    <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Starter Template
                      </label>
                      <div className="relative">
                        <div className="absolute top-2 left-2 flex gap-1.5">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                        <textarea
                          {...register(`startCode.${index}.initialCode`)}
                          className="w-full h-48 bg-gray-900 text-gray-100 font-mono text-sm p-4 pt-8 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                          spellCheck="false"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reference Solution
                      </label>
                      <div className="relative">
                        <div className="absolute top-2 left-2 flex gap-1.5">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                        <textarea
                          {...register(`referenceSolution.${index}.completeCode`)}
                          className="w-full h-48 bg-gray-900 text-gray-100 font-mono text-sm p-4 pt-8 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                          spellCheck="false"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-6 z-10">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Creating Problem...
                </>
              ) : (
                'Publish Problem'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;