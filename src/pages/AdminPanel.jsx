import React, { useState, useEffect } from 'react';
import { getTags, deleteTag } from '../firebase/tagService';
import TagManager from '../components/TagManager';
import { deleteAllQuestions } from '../firebase/questionService';
import { deleteAllCourses } from '../firebase/courseService';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('tags');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleTagChange = (tagIds) => {
    setSelectedTags(tagIds);
  };

  const handleDeleteAllQuestions = async () => {
    if (window.confirm('Are you sure you want to delete ALL questions? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        setError(null);
        await deleteAllQuestions();
        setMessage('All questions have been successfully deleted.');
      } catch (err) {
        console.error('Error deleting questions:', err);
        setError('Failed to delete all questions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteAllCourses = async () => {
    if (window.confirm('Are you sure you want to delete ALL courses? This will also delete all questions associated with these courses. This action cannot be undone.')) {
      try {
        setIsLoading(true);
        setError(null);
        await deleteAllCourses();
        setMessage('All courses and their associated questions have been successfully deleted.');
      } catch (err) {
        console.error('Error deleting courses:', err);
        setError('Failed to delete all courses. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearMessages = () => {
    setMessage(null);
    setError(null);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h1>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => { setActiveTab('tags'); clearMessages(); }}
            className={`${
              activeTab === 'tags'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Tag Management
          </button>
          <button
            onClick={() => { setActiveTab('database'); clearMessages(); }}
            className={`${
              activeTab === 'database'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Database Operations
          </button>
        </nav>
      </div>
      
      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{message}</p>
        </div>
      )}
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center items-center my-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="ml-2 text-gray-600">Processing...</span>
        </div>
      )}
      
      {/* Tab Content */}
      {activeTab === 'tags' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Tag Management</h2>
          <p className="text-gray-600 mb-4">
            Create, edit, and delete tags for your questions. Tags help categorize and filter questions.
          </p>
          <div className="bg-gray-50 p-6 rounded-lg">
            <TagManager 
              selectedTags={selectedTags} 
              onChange={handleTagChange} 
              className="w-full"
              showControls={true}
            />
          </div>
        </div>
      )}
      
      {activeTab === 'database' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Database Operations</h2>
          <p className="text-gray-600 mb-6">
            Perform maintenance operations on your database. Be careful, these actions cannot be undone.
          </p>
          
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Questions</h3>
              <p className="text-sm text-gray-500 mb-4">
                Delete all questions from the database. This will not affect courses.
              </p>
              <button
                onClick={handleDeleteAllQuestions}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete All Questions
              </button>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Courses</h3>
              <p className="text-sm text-gray-500 mb-4">
                Delete all courses from the database. This will also delete all questions associated with these courses.
              </p>
              <button
                onClick={handleDeleteAllCourses}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete All Courses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
