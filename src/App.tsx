import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CourseList from './pages/CourseList.jsx';
import CourseForm from './pages/CourseForm.jsx';
import QuestionList from './pages/QuestionList.jsx';
import QuestionForm from './pages/QuestionForm.jsx';
import StudyMode from './pages/StudyMode.jsx';
import NotFound from './pages/NotFound.jsx';
import DatabaseSeeder from './components/DatabaseSeeder.jsx';
import { getCourses } from './firebase/courseService.js';
import { getQuestions } from './firebase/questionService.js';

// Define types for our data
interface Course {
  id: string;
  title: string;
  description: string;
  color?: string;
  created_at: Date;
  updated_at: Date;
}

interface Question {
  id: string;
  course_id: string;
  title: string;
  content: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: string;
  estimated_time?: number;
  created_at: Date;
  updated_at: Date;
}

function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const coursesData = await getCourses();
        const questionsData = await getQuestions();
        
        setCourses(coursesData);
        setQuestions(questionsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
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
            <Routes>
              <Route path="/" element={<Dashboard courses={courses} questions={questions} />} />
              <Route path="/dashboard" element={<Dashboard courses={courses} questions={questions} />} />
              <Route path="/courses" element={<CourseList courses={courses} setCourses={setCourses} />} />
              <Route path="/courses/new" element={<CourseForm setCourses={setCourses} />} />
              <Route path="/courses/edit/:id" element={<CourseForm courses={courses} setCourses={setCourses} />} />
              
              <Route path="/questions" element={<QuestionList questions={questions} courses={courses} setQuestions={setQuestions} />} />
              <Route path="/questions/new" element={<QuestionForm courses={courses} setQuestions={setQuestions} />} />
              <Route path="/questions/edit/:id" element={<QuestionForm questions={questions} courses={courses} setQuestions={setQuestions} />} />
              <Route path="/questions/course/:courseId" element={<QuestionList questions={questions} courses={courses} setQuestions={setQuestions} />} />
              
              <Route path="/study/:courseId?" element={<StudyMode questions={questions} courses={courses} />} />
              
              <Route path="/setup" element={<DatabaseSeeder />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
