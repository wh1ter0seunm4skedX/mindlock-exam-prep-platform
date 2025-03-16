import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getTagsByIds } from '../firebase/tagService';
import TagDisplay from './TagDisplay';

const QuestionFilters = ({ 
  courses = [], 
  selectedCourse,
  selectedTopic,
  selectedDifficulty,
  selectedTags = [],
  onCourseChange,
  onTopicChange,
  onDifficultyChange,
  onTagsChange
}) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get the current course object
  const currentCourse = courses.find(c => c.id === selectedCourse);
  
  // Update available topics when the selected course changes
  useEffect(() => {
    if (currentCourse && currentCourse.topics && currentCourse.topics.length > 0) {
      setAvailableTopics(currentCourse.topics);
    } else {
      setAvailableTopics([]);
    }
    
    // Reset selected topic when course changes
    if (onTopicChange && selectedTopic) {
      onTopicChange('all');
    }
  }, [currentCourse, onTopicChange, selectedTopic]);

  // Fetch tag details for selected tags
  useEffect(() => {
    const fetchTagDetails = async () => {
      if (selectedTags && selectedTags.length > 0) {
        try {
          setIsLoading(true);
          const tagDetails = await getTagsByIds(selectedTags);
          setAvailableTags(tagDetails);
        } catch (error) {
          console.error('Error fetching tag details:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setAvailableTags([]);
      }
    };

    fetchTagDetails();
  }, [selectedTags]);

  const handleClearFilters = () => {
    if (onCourseChange) onCourseChange('all');
    if (onTopicChange) onTopicChange('all');
    if (onDifficultyChange) onDifficultyChange('all');
    if (onTagsChange) onTagsChange([]);
  };

  const handleRemoveTag = (tagToRemove) => {
    if (onTagsChange) {
      const newTags = selectedTags.filter(tagId => tagId !== tagToRemove.id);
      onTagsChange(newTags);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <button
          type="button"
          onClick={handleClearFilters}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          Clear all
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Course Filter */}
        <div>
          <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700">
            Course
          </label>
          <select
            id="course-filter"
            name="course-filter"
            value={selectedCourse || 'all'}
            onChange={(e) => onCourseChange && onCourseChange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        
        {/* Topic Filter - Only show if a course is selected */}
        {selectedCourse && selectedCourse !== 'all' && availableTopics.length > 0 && (
          <div>
            <label htmlFor="topic-filter" className="block text-sm font-medium text-gray-700">
              Topic
            </label>
            <select
              id="topic-filter"
              name="topic-filter"
              value={selectedTopic || 'all'}
              onChange={(e) => onTopicChange && onTopicChange(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Topics</option>
              {availableTopics.map((topic, index) => (
                <option key={index} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Difficulty Filter */}
        <div>
          <label htmlFor="difficulty-filter" className="block text-sm font-medium text-gray-700">
            Difficulty
          </label>
          <select
            id="difficulty-filter"
            name="difficulty-filter"
            value={selectedDifficulty || 'all'}
            onChange={(e) => onDifficultyChange && onDifficultyChange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>
      
      {/* Selected Tags Display */}
      {availableTags.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selected Tags
          </label>
          <TagDisplay 
            tags={availableTags} 
            onTagClick={handleRemoveTag} 
            className="mt-1"
          />
        </div>
      )}
      
      {isLoading && (
        <div className="flex justify-center items-center mt-2">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="ml-2 text-xs text-gray-600">Loading tags...</span>
        </div>
      )}
    </div>
  );
};

QuestionFilters.propTypes = {
  courses: PropTypes.array,
  selectedCourse: PropTypes.string,
  selectedTopic: PropTypes.string,
  selectedDifficulty: PropTypes.string,
  selectedTags: PropTypes.arrayOf(PropTypes.string),
  onCourseChange: PropTypes.func,
  onTopicChange: PropTypes.func,
  onDifficultyChange: PropTypes.func,
  onTagsChange: PropTypes.func
};

export default QuestionFilters;
