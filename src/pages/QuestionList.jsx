import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { deleteQuestion, getQuestionsByCourse, getQuestionsByFilters } from '../firebase/questionService';
import QuestionFilters from '../components/QuestionFilters';
import TagDisplay from '../components/TagDisplay';
import TopicDisplay from '../components/TopicDisplay';
import { getTags } from '../firebase/tagService';

function QuestionList({ questions = [], courses = [], setQuestions }) {
  const { courseId } = useParams();
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(courseId || 'all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allTags, setAllTags] = useState([]);

  // Fetch all tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await getTags();
        setAllTags(tags);
      } catch (err) {
        console.error('Error fetching tags:', err);
      }
    };
    
    fetchTags();
  }, []);

  useEffect(() => {
    const filterQuestions = async () => {
      try {
        setIsLoading(true);
        
        // If courseId is provided in URL, use that as the selected course
        if (courseId && courseId !== 'all') {
          setSelectedCourse(courseId);
        }
        
        // Prepare filter criteria
        const filters = {
          courseId: selectedCourse !== 'all' ? selectedCourse : null,
          topic: selectedTopic !== 'all' ? selectedTopic : null,
          difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : null,
          tagIds: selectedTags.length > 0 ? selectedTags : null
        };
        
        // Check if we need to fetch questions or can filter from existing ones
        let filtered = [];
        
        // If we have complex filters or no questions in state, fetch from Firestore
        if (
          (filters.tagIds && filters.tagIds.length > 0) || 
          filters.topic || 
          questions.length === 0
        ) {
          filtered = await getQuestionsByFilters(filters);
          
          // Update the global questions state with the fetched questions
          setQuestions(prev => {
            const existingIds = new Set(prev.map(q => q.id));
            const newQuestions = filtered.filter(q => !existingIds.has(q.id));
            return [...prev, ...newQuestions];
          });
        } else {
          // Filter locally
          filtered = [...questions];
          
          if (filters.courseId) {
            filtered = filtered.filter(q => q.course_id === filters.courseId);
          }
          
          if (filters.difficulty) {
            filtered = filtered.filter(q => q.difficulty === filters.difficulty);
          }
        }
        
        setFilteredQuestions(filtered);
      } catch (err) {
        console.error('Error filtering questions:', err);
        setError('Failed to load questions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    filterQuestions();
  }, [courseId, questions, selectedCourse, selectedTopic, selectedDifficulty, selectedTags, setQuestions]);

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

      <QuestionFilters
        courses={courses}
        selectedCourse={selectedCourse}
        selectedTopic={selectedTopic}
        selectedDifficulty={selectedDifficulty}
        selectedTags={selectedTags}
        onCourseChange={setSelectedCourse}
        onTopicChange={setSelectedTopic}
        onDifficultyChange={setSelectedDifficulty}
        onTagsChange={setSelectedTags}
      />

      {(isLoading || isDeleting) && (
        <div className="flex justify-center items-center my-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="ml-2 text-gray-600">{isDeleting ? 'Deleting...' : 'Loading...'}</span>
        </div>
      )}

      {!isLoading && filteredQuestions.length === 0 ? (
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
            {selectedCourse !== 'all' || selectedTopic !== 'all' || selectedDifficulty !== 'all' || selectedTags.length > 0
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
              const questionTags = allTags.filter(tag => question.tags && question.tags.includes(tag.id));
              
              return (
                <li key={question.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-medium text-indigo-600 truncate">
                          {question.title || question.content.substring(0, 50)}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center text-sm text-gray-500 gap-2">
                          {course && (
                            <div className="flex items-center mr-4">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: course.color || '#4f46e5' }}
                              ></div>
                              <span>{course.title}</span>
                            </div>
                          )}
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {question.difficulty || 'medium'}
                          </span>
                          {question.type && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {question.type}
                            </span>
                          )}
                          {question.estimated_time && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {question.estimated_time} min
                            </span>
                          )}
                          {question.topic && (
                            <TopicDisplay topic={question.topic} />
                          )}
                        </div>
                        {questionTags.length > 0 && (
                          <div className="mt-2">
                            <TagDisplay tags={questionTags} />
                          </div>
                        )}
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
