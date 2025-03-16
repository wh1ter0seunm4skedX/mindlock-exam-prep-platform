import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addQuestion, updateQuestion, getQuestionById } from '../firebase/questionService';
import { getTags } from '../firebase/tagService';
import TagManager from '../components/TagManager';

function QuestionForm({ questions = [], courses = [], setQuestions }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    content: '',
    answer: '',
    difficulty: 'medium',
    type: 'problem_solving',
    topic: '',
    tags: [],
    estimated_time: '15'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableTopics, setAvailableTopics] = useState([]);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (isEditing) {
        try {
          setLoading(true);
          // First try to find the question in the existing questions array
          const existingQuestion = questions.find(question => question.id === id);
          
          if (existingQuestion) {
            setFormData({
              course_id: existingQuestion.course_id || '',
              title: existingQuestion.title || '',
              content: existingQuestion.content || '',
              answer: existingQuestion.answer || '',
              difficulty: existingQuestion.difficulty || 'medium',
              type: existingQuestion.type || 'problem_solving',
              topic: existingQuestion.topic || '',
              tags: existingQuestion.tags || [],
              estimated_time: existingQuestion.estimated_time || '15'
            });
          } else {
            // If not found in the array, fetch from Firestore
            const questionData = await getQuestionById(id);
            if (questionData) {
              setFormData({
                course_id: questionData.course_id || '',
                title: questionData.title || '',
                content: questionData.content || '',
                answer: questionData.answer || '',
                difficulty: questionData.difficulty || 'medium',
                type: questionData.type || 'problem_solving',
                topic: questionData.topic || '',
                tags: questionData.tags || [],
                estimated_time: questionData.estimated_time || '15'
              });
            } else {
              setError('Question not found');
              navigate('/questions');
            }
          }
        } catch (err) {
          console.error('Error fetching question:', err);
          setError('Failed to load question data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchQuestion();
  }, [id, isEditing, questions, navigate]);

  // Update available topics when course_id changes
  useEffect(() => {
    if (formData.course_id) {
      const selectedCourse = courses.find(c => c.id === formData.course_id);
      if (selectedCourse && selectedCourse.topics && selectedCourse.topics.length > 0) {
        setAvailableTopics(selectedCourse.topics);
        
        // If the current topic is not in the available topics, reset it
        if (formData.topic && !selectedCourse.topics.includes(formData.topic)) {
          setFormData(prev => ({ ...prev, topic: '' }));
        }
      } else {
        setAvailableTopics([]);
      }
    } else {
      setAvailableTopics([]);
    }
  }, [formData.course_id, courses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagsChange = (selectedTagIds) => {
    setFormData(prev => ({
      ...prev,
      tags: selectedTagIds
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      setError('Question content is required');
      return;
    }

    if (!formData.course_id) {
      setError('Please select a course');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (isEditing) {
        const updatedQuestion = await updateQuestion(id, formData);
        setQuestions(prev => prev.map(question => 
          question.id === id ? { ...question, ...updatedQuestion } : question
        ));
      } else {
        const newQuestion = await addQuestion(formData);
        setQuestions(prev => [...prev, newQuestion]);
      }
      
      navigate('/questions');
    } catch (err) {
      console.error('Error saving question:', err);
      setError('Failed to save question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const typeOptions = [
    { value: 'problem_solving', label: 'Problem Solving' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'true_false', label: 'True/False' },
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'essay', label: 'Essay' },
    { value: 'coding', label: 'Coding' }
  ];

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
            {isEditing ? 'Edit Question' : 'New Question'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <label htmlFor="course_id" className="block text-sm font-medium text-gray-700">
              Course <span className="text-red-500">*</span>
            </label>
            <select
              id="course_id"
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="" disabled>Select a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Optional title for the question"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Question Content <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              id="content"
              value={formData.content}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your question here"
              required
            />
          </div>

          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
              Answer
            </label>
            <textarea
              name="answer"
              id="answer"
              value={formData.answer}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter the answer here"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {difficultyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Question Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                Topic
              </label>
              <select
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select a topic</option>
                {availableTopics.map((topic, index) => (
                  <option key={index} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
              {availableTopics.length === 0 && formData.course_id && (
                <p className="mt-1 text-xs text-amber-600">
                  No topics available for this course. Add topics in the course settings.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="estimated_time" className="block text-sm font-medium text-gray-700">
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                name="estimated_time"
                id="estimated_time"
                value={formData.estimated_time}
                onChange={handleChange}
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Tag Manager */}
          <div>
            <TagManager 
              selectedTags={formData.tags} 
              onChange={handleTagsChange} 
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/questions')}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuestionForm;
