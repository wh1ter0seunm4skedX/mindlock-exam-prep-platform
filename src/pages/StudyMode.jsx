import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuestionsByCourse } from '../firebase/questionService';

function StudyMode({ questions = [], courses = [] }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [studyQuestions, setStudyQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(courseId || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        let filteredQuestions = [];
        
        // If courseId is provided, fetch questions for that course
        if (courseId && courseId !== 'all') {
          // Check if we already have the questions in our state
          const courseQuestions = questions.filter(q => q.course_id === courseId);
          
          // If we don't have any questions for this course in our state, fetch them
          if (courseQuestions.length === 0) {
            filteredQuestions = await getQuestionsByCourse(courseId);
          } else {
            filteredQuestions = courseQuestions;
          }
          
          setSelectedCourse(courseId);
        } else {
          // Use all questions
          filteredQuestions = [...questions];
        }
        
        // Apply difficulty filter if selected
        if (selectedDifficulty !== 'all') {
          filteredQuestions = filteredQuestions.filter(q => q.difficulty === selectedDifficulty);
        }
        
        // Shuffle questions for study mode
        const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
        setStudyQuestions(shuffled);
        setCurrentIndex(0);
        setShowAnswer(false);
      } catch (err) {
        console.error('Error loading questions for study:', err);
        setError('Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadQuestions();
  }, [courseId, questions, selectedDifficulty]);

  const handleCourseChange = (e) => {
    const newCourseId = e.target.value;
    setSelectedCourse(newCourseId);
    
    if (newCourseId === 'all') {
      navigate('/study');
    } else {
      navigate(`/study/${newCourseId}`);
    }
  };

  const handleDifficultyChange = (e) => {
    setSelectedDifficulty(e.target.value);
  };

  const handleNext = () => {
    if (currentIndex < studyQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const currentQuestion = studyQuestions[currentIndex];
  const currentCourse = currentQuestion 
    ? courses.find(c => c.id === currentQuestion.course_id) 
    : null;

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

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700">
              Select Course
            </label>
            <select
              id="course-filter"
              name="course-filter"
              value={selectedCourse}
              onChange={handleCourseChange}
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
          
          <div>
            <label htmlFor="difficulty-filter" className="block text-sm font-medium text-gray-700">
              Difficulty Level
            </label>
            <select
              id="difficulty-filter"
              name="difficulty-filter"
              value={selectedDifficulty}
              onChange={handleDifficultyChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
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
      ) : studyQuestions.length === 0 ? (
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
            {selectedCourse !== 'all' || selectedDifficulty !== 'all'
              ? 'Try changing your filters or add questions to this course.'
              : 'Get started by adding questions to your courses.'}
          </p>
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
          
          <div className="mb-8">
            <button
              onClick={toggleAnswer}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>
            
            {showAnswer && currentQuestion.answer && (
              <div className="mt-4 bg-green-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-green-900 mb-2">Answer</h3>
                <p className="text-green-800 whitespace-pre-wrap">{currentQuestion.answer}</p>
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
    </div>
  );
}

export default StudyMode;
