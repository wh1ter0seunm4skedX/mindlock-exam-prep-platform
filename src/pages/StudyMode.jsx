import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuestionsByCourse, getQuestionsByFilters } from '../firebase/questionService';
import { getTags } from '../firebase/tagService';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

function StudyMode({ questions = [], courses = [] }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  // Study mode state
  const [studyQuestions, setStudyQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  
  // Selection state
  const [step, setStep] = useState(1); // 1: Course, 2: Topics, 3: Question Types, 4: Study
  const [selectedCourse, setSelectedCourse] = useState(courseId || '');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  // Load tags on component mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getTags();
        setAvailableTags(tags);
      } catch (err) {
        console.error('Error loading tags:', err);
      }
    };
    
    loadTags();
  }, []);

  // Update available topics when course changes
  useEffect(() => {
    if (selectedCourse) {
      const course = courses.find(c => c.id === selectedCourse);
      if (course && course.topics) {
        setAvailableTopics(course.topics);
      } else {
        setAvailableTopics([]);
      }
      setSelectedTopics([]);
    }
  }, [selectedCourse, courses]);

  // Load questions when starting study mode
  const startStudyMode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare filter criteria
      const filters = {
        courseId: selectedCourse,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined
      };
      
      // Add topic filter if topics are selected
      if (selectedTopics.length > 0) {
        filters.topics = selectedTopics;
      }
      
      // Add tag filter for question types
      if (selectedQuestionTypes.length > 0) {
        filters.tagIds = selectedQuestionTypes;
      }
      
      // Get filtered questions
      let filteredQuestions = await getQuestionsByFilters(filters);
      
      // Shuffle questions for study mode
      const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
      setStudyQuestions(shuffled);
      setCurrentIndex(0);
      setShowAnswer(false);
      setUserAnswer('');
      setStep(4); // Move to study mode
    } catch (err) {
      console.error('Error loading questions for study:', err);
      setError('Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (e) => {
    const newCourseId = e.target.value;
    setSelectedCourse(newCourseId);
  };

  const handleDifficultyChange = (e) => {
    setSelectedDifficulty(e.target.value);
  };

  const handleTopicToggle = (topic) => {
    setSelectedTopics(prev => {
      if (prev.includes(topic)) {
        return prev.filter(t => t !== topic);
      } else {
        return [...prev, topic];
      }
    });
  };

  const handleQuestionTypeToggle = (tagId) => {
    setSelectedQuestionTypes(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const handleNext = () => {
    if (currentIndex < studyQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setUserAnswer('');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
      setUserAnswer('');
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const handleUserAnswerChange = (e) => {
    setUserAnswer(e.target.value);
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedCourse) {
      setError('Please select a course to continue');
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
      setError(null);
    } else {
      startStudyMode();
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
    }
  };

  const handleRestart = () => {
    setStep(1);
    setSelectedTopics([]);
    setSelectedQuestionTypes([]);
    setSelectedDifficulty('all');
    setStudyQuestions([]);
  };

  const currentQuestion = studyQuestions[currentIndex];
  const currentCourse = currentQuestion 
    ? courses.find(c => c.id === currentQuestion.course_id) 
    : null;

  // Filter tags to only show question type tags
  const questionTypeTags = availableTags.filter(tag => 
    ['Concept', 'Implementation', 'Calculation', 'Proof', 'Analysis'].includes(tag.name)
  );

  // Render the appropriate step
  const renderStep = () => {
    switch (step) {
      case 1: // Course selection
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Step 1: Select a Course</h2>
            <p className="text-gray-600 mb-4">Choose which course you want to study</p>
            
            <div className="mb-6">
              <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <select
                id="course-select"
                value={selectedCourse}
                onChange={handleCourseChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleNextStep}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next
                <ChevronRightIcon className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        );
        
      case 2: // Topic selection
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Step 2: Select Topics</h2>
            <p className="text-gray-600 mb-4">Choose which topics you want to study (select none for all topics)</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topics
              </label>
              
              {availableTopics.length === 0 ? (
                <p className="text-sm text-gray-500">No topics available for this course</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availableTopics.map(topic => (
                    <div key={topic} className="flex items-center">
                      <input
                        id={`topic-${topic}`}
                        type="checkbox"
                        checked={selectedTopics.includes(topic)}
                        onChange={() => handleTopicToggle(topic)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`topic-${topic}`} className="ml-2 text-sm text-gray-700">
                        {topic}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="difficulty-select" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                id="difficulty-select"
                value={selectedDifficulty}
                onChange={handleDifficultyChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handlePreviousStep}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next
                <ChevronRightIcon className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        );
        
      case 3: // Question type selection
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Step 3: Select Question Types</h2>
            <p className="text-gray-600 mb-4">Choose which types of questions you want to study (select none for all types)</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Types
              </label>
              
              {questionTypeTags.length === 0 ? (
                <p className="text-sm text-gray-500">No question types available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {questionTypeTags.map(tag => (
                    <div key={tag.id} className="flex items-center">
                      <input
                        id={`tag-${tag.id}`}
                        type="checkbox"
                        checked={selectedQuestionTypes.includes(tag.id)}
                        onChange={() => handleQuestionTypeToggle(tag.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label 
                        htmlFor={`tag-${tag.id}`} 
                        className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: tag.color,
                          color: getContrastColor(tag.color)
                        }}
                      >
                        {tag.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handlePreviousStep}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Start Studying
              </button>
            </div>
          </div>
        );
        
      case 4: // Study mode
        return (
          <>
            {studyQuestions.length === 0 ? (
              <div className="text-center py-12 bg-white shadow rounded-lg">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No questions found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try changing your filters or add more questions to this course.
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleRestart}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Change Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">
                      Question {currentIndex + 1} of {studyQuestions.length}
                    </span>
                    {currentQuestion.difficulty && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {currentQuestion.difficulty}
                      </span>
                    )}
                    {currentQuestion.type && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {currentQuestion.type}
                      </span>
                    )}
                    {currentQuestion.estimated_time && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {currentQuestion.estimated_time} min
                      </span>
                    )}
                  </div>
                  {currentCourse && (
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: currentCourse.color || '#4f46e5' }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{currentCourse.title}</span>
                    </div>
                  )}
                </div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-medium text-gray-900 mb-4">
                    {currentQuestion.title || 'Question'}
                  </h2>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-800 whitespace-pre-wrap">{currentQuestion.content}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="user-answer" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Answer
                  </label>
                  <textarea
                    id="user-answer"
                    rows={6}
                    value={userAnswer}
                    onChange={handleUserAnswerChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Write your answer here..."
                  ></textarea>
                </div>
                
                <div className="mb-8">
                  <button
                    onClick={toggleAnswer}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {showAnswer ? 'Hide Answer' : 'Show Answer'}
                  </button>
                  
                  {showAnswer && (
                    <div className="mt-4 bg-green-50 p-4 rounded-md">
                      <h3 className="text-lg font-medium text-green-900 mb-2">Answer</h3>
                      {currentQuestion.answer ? (
                        <p className="text-green-800 whitespace-pre-wrap">{currentQuestion.answer}</p>
                      ) : (
                        <p className="text-green-800 italic">No model answer provided for this question.</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentIndex === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleRestart}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Change Filters
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === studyQuestions.length - 1}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                      currentIndex === studyQuestions.length - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Mode</h1>
          <p className="mt-1 text-sm text-gray-500">
            Practice with your exam questions
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Progress indicator */}
          {step < 4 && (
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex flex-col items-center">
                    <div 
                      className={`rounded-full h-8 w-8 flex items-center justify-center ${
                        stepNumber === step 
                          ? 'bg-indigo-600 text-white' 
                          : stepNumber < step 
                            ? 'bg-indigo-200 text-indigo-800' 
                            : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {stepNumber}
                    </div>
                    <div className="text-xs mt-1">
                      {stepNumber === 1 ? 'Course' : stepNumber === 2 ? 'Topics' : 'Question Types'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative mt-1">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200"></div>
                </div>
                <div className="relative flex justify-between">
                  <div className={`h-0.5 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} style={{ width: '50%' }}></div>
                  <div className={`h-0.5 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`} style={{ width: '50%' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {renderStep()}
        </>
      )}
    </div>
  );
}

// Helper function to determine text color based on background color
const getContrastColor = (hexColor) => {
  // Remove the hash if it exists
  hexColor = hexColor.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export default StudyMode;
