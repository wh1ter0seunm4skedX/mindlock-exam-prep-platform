import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { deleteQuestion, getQuestionsByCourse } from '../firebase/questionService';

function QuestionList({ questions = [], courses = [], setQuestions }) {
  const { courseId } = useParams();
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(courseId || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  useEffect(() => {
    const filterQuestions = async () => {
      try {
        let filtered = [...questions];
        
        // If courseId is provided in URL, fetch questions for that course
        if (courseId && courseId !== 'all') {
          // First check if we already have the questions in our state
          const courseQuestions = questions.filter(q => q.course_id === courseId);
          
          // If we don't have any questions for this course in our state, fetch them
          if (courseQuestions.length === 0) {
            const fetchedQuestions = await getQuestionsByCourse(courseId);
            filtered = fetchedQuestions;
            // Update the global questions state with the fetched questions
            setQuestions(prev => {
              const existingIds = new Set(prev.map(q => q.id));
              const newQuestions = fetchedQuestions.filter(q => !existingIds.has(q.id));
              return [...prev, ...newQuestions];
            });
          } else {
            filtered = courseQuestions;
          }
          
          setSelectedCourse(courseId);
        } else if (selectedCourse && selectedCourse !== 'all') {
          filtered = filtered.filter(q => q.course_id === selectedCourse);
        }
        
        if (selectedDifficulty && selectedDifficulty !== 'all') {
          filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
        }
        
        setFilteredQuestions(filtered);
      } catch (err) {
        console.error('Error filtering questions:', err);
        setError('Failed to load questions. Please try again.');
      }
    };
    
    filterQuestions();
  }, [courseId, questions, selectedCourse, selectedDifficulty, setQuestions]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        setIsDeleting(true);
        await deleteQuestion(id);
        setQuestions(questions.filter(question => question.id !== id));
        setFilteredQuestions(filteredQuestions.filter(question => question.id !== id));
      } catch (err) {
        console.error('Error deleting question:', err);
        setError('Failed to delete question. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  const handleDifficultyChange = (e) => {
    setSelectedDifficulty(e.target.value);
  };

  const currentCourse = courses.find(c => c.id === selectedCourse);

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentCourse ? `Questions: ${currentCourse.title}` : 'All Questions'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your exam questions
          </p>
        </div>
        <Link
          to="/questions/new"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Question
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700">
              Filter by Course
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
              Filter by Difficulty
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

      {isDeleting && (
        <div className="flex justify-center items-center my-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="ml-2 text-gray-600">Deleting...</span>
        </div>
      )}

      {filteredQuestions.length === 0 ? (
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
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No questions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedCourse !== 'all' || selectedDifficulty !== 'all'
              ? 'Try changing your filters or add a new question.'
              : 'Get started by creating a new question.'}
          </p>
          <div className="mt-6">
            <Link
              to="/questions/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Question
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredQuestions.map((question) => {
              const course = courses.find(c => c.id === question.course_id);
              
              return (
                <li key={question.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-medium text-indigo-600 truncate">
                          {question.title || question.content.substring(0, 50)}
                        </p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          {course && (
                            <div className="flex items-center mr-4">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: course.color || '#4f46e5' }}
                              ></div>
                              <span>{course.title}</span>
                            </div>
                          )}
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ml-2">
                            {question.difficulty || 'medium'}
                          </span>
                          {question.type && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                              {question.type}
                            </span>
                          )}
                          {question.estimated_time && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                              {question.estimated_time} min
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/questions/edit/${question.id}`}
                          className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <PencilIcon className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <button
                          onClick={() => handleDelete(question.id)}
                          className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          disabled={isDeleting}
                        >
                          <TrashIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-900">{question.content}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default QuestionList;
