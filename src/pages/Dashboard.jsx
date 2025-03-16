import { Link } from 'react-router-dom';
import { PlusIcon, BookOpenIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

function Dashboard({ courses, questions }) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Courses Overview */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Courses</h2>
            <Link
              to="/courses/new"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
              Add Course
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new course.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.slice(0, 5).map((course) => (
                <Link
                  key={course.id}
                  to={`/questions/course/${course.id}`}
                  className="block p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3" 
                      style={{ backgroundColor: course.color || '#4f46e5' }}
                    ></div>
                    <span className="font-medium text-gray-900">{course.title}</span>
                  </div>
                  {course.description && (
                    <p className="mt-1 text-sm text-gray-500 truncate">{course.description}</p>
                  )}
                </Link>
              ))}
              
              {courses.length > 5 && (
                <Link 
                  to="/courses" 
                  className="block text-sm text-indigo-600 hover:text-indigo-500 text-center mt-4"
                >
                  View all courses
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Questions Overview */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Questions</h2>
            <Link
              to="/questions/new"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
              Add Question
            </Link>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-8">
              <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No questions</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new question.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.slice(0, 5).map((question) => {
                const course = courses.find(c => c.id === question.course_id);
                
                return (
                  <Link
                    key={question.id}
                    to={`/questions/edit/${question.id}`}
                    className="block p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 truncate">
                        {question.title || question.content.substring(0, 50)}
                      </span>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                        {question.difficulty || 'medium'}
                      </span>
                    </div>
                    {course && (
                      <div className="mt-2 flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-2" 
                          style={{ backgroundColor: course.color || '#4f46e5' }}
                        ></div>
                        <span className="text-xs text-gray-500">{course.title}</span>
                      </div>
                    )}
                  </Link>
                );
              })}
              
              {questions.length > 5 && (
                <Link 
                  to="/questions" 
                  className="block text-sm text-indigo-600 hover:text-indigo-500 text-center mt-4"
                >
                  View all questions
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Study Mode Card */}
      <div className="bg-indigo-50 shadow rounded-lg p-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-medium text-indigo-900">Ready to study?</h3>
            <p className="mt-1 text-sm text-indigo-700">
              Enter study mode to practice with your questions.
            </p>
          </div>
          <div className="mt-5 sm:mt-0">
            <Link
              to="/study"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Start Studying
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
