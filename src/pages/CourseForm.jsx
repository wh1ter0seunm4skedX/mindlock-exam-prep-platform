import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addCourse, updateCourse, getCourseById } from '../firebase/courseService';

function CourseForm({ courses = [], setCourses }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#4f46e5' // Default indigo color
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (isEditing) {
        try {
          setLoading(true);
          // First try to find the course in the existing courses array
          const existingCourse = courses.find(course => course.id === id);
          
          if (existingCourse) {
            setFormData({
              title: existingCourse.title || '',
              description: existingCourse.description || '',
              color: existingCourse.color || '#4f46e5'
            });
          } else {
            // If not found in the array, fetch from Firestore
            const courseData = await getCourseById(id);
            if (courseData) {
              setFormData({
                title: courseData.title || '',
                description: courseData.description || '',
                color: courseData.color || '#4f46e5'
              });
            } else {
              setError('Course not found');
              navigate('/courses');
            }
          }
        } catch (err) {
          console.error('Error fetching course:', err);
          setError('Failed to load course data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCourse();
  }, [id, isEditing, courses, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (isEditing) {
        const updatedCourse = await updateCourse(id, formData);
        setCourses(prev => prev.map(course => 
          course.id === id ? { ...course, ...updatedCourse } : course
        ));
      } else {
        const newCourse = await addCourse(formData);
        setCourses(prev => [...prev, newCourse]);
      }
      
      navigate('/courses');
    } catch (err) {
      console.error('Error saving course:', err);
      setError('Failed to save course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = [
    { value: '#4f46e5', label: 'Indigo' },
    { value: '#16a34a', label: 'Green' },
    { value: '#ea580c', label: 'Orange' },
    { value: '#dc2626', label: 'Red' },
    { value: '#2563eb', label: 'Blue' },
    { value: '#9333ea', label: 'Purple' },
    { value: '#db2777', label: 'Pink' },
    { value: '#65a30d', label: 'Lime' },
    { value: '#0891b2', label: 'Cyan' },
    { value: '#f59e0b', label: 'Amber' }
  ];

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
            {isEditing ? 'Edit Course' : 'New Course'}
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., Algorithms, Data Structures, etc."
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Optional description of the course"
            />
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700">
              Color
            </label>
            <div className="mt-1 flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <div key={color.value} className="flex items-center">
                  <input
                    type="radio"
                    id={`color-${color.value}`}
                    name="color"
                    value={color.value}
                    checked={formData.color === color.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor={`color-${color.value}`}
                    className={`relative p-0.5 rounded-full flex items-center justify-center cursor-pointer focus:outline-none ${
                      formData.color === color.value ? 'ring-2 ring-offset-2 ring-gray-900' : ''
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      style={{ backgroundColor: color.value }}
                      className="h-8 w-8 rounded-full border border-black border-opacity-10"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CourseForm;
