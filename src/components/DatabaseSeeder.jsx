import { useState } from 'react';
import { seedDatabase } from '../utils/seedDatabase';

const DatabaseSeeder = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSeedDatabase = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await seedDatabase();
      setResult(result);
    } catch (err) {
      console.error('Error seeding database:', err);
      setError(err.message || 'An error occurred while seeding the database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4">Database Seeder</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Firestore Schema</h3>
        <div className="bg-gray-50 p-4 rounded border border-gray-200 overflow-auto">
          <pre className="text-sm">
{`// Firestore Database Schema

// Collection: courses
{
  id: string,          // Auto-generated Firestore document ID
  title: string,       // Course title (e.g., "Algorithms", "Probability")
  description: string, // Course description
  color: string,       // Hex color code for UI display
  topics: array,       // Array of topic strings within the course
  created_date: timestamp, // When the course was created
  updated_date: timestamp, // When the course was last updated
  is_sample: boolean   // Whether this is a sample course
}

// Collection: questions
{
  id: string,          // Auto-generated Firestore document ID
  course_id: string,   // Reference to parent course ID
  title: string,       // Question title/summary
  content: string,     // Full question text
  answer: string,      // Answer text (can include markdown/code)
  difficulty: string,  // "easy", "medium", or "hard"
  type: string,        // Question type (e.g., "concept", "implementation", "calculation")
  topic: string,       // Topic from the parent course's topics array
  tags: array,         // Array of tag IDs
  estimated_time: number, // Estimated time to answer (in minutes)
  created_date: timestamp, // When the question was created
  updated_date: timestamp, // When the question was last updated
  is_sample: boolean   // Whether this is a sample question
}

// Collection: tags
{
  id: string,          // Auto-generated Firestore document ID
  name: string,        // Tag name (e.g., "Important", "Review")
  color: string,       // Hex color code for UI display
  created_date: timestamp, // When the tag was created
  updated_date: timestamp  // When the tag was last updated
}`}
          </pre>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Sample Data</h3>
        <div className="bg-gray-50 p-4 rounded border border-gray-200 overflow-auto">
          <pre className="text-sm">
{`// Two courses will be created:
1. "Algorithms" (with indigo color)
   - Topics: Time Complexity, Searching Algorithms, Sorting Algorithms, Data Structures, Dynamic Programming
   - Contains 3 questions on different topics with tags

2. "Probability" (with emerald color)
   - Topics: Probability Basics, Conditional Probability, Distributions, Statistical Inference, Bayesian Statistics
   - Contains 3 questions on different topics with tags

// Five tags will be created:
1. "Important" (red)
2. "Review" (amber)
3. "Theory" (violet)
4. "Practice" (emerald)
5. "Interview" (blue)

// Each question includes:
- Title
- Detailed content
- Comprehensive answer
- Difficulty level
- Question type
- Topic from parent course
- Associated tags
- Estimated completion time`}
          </pre>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSeedDatabase}
          disabled={loading}
          className={`px-4 py-2 rounded font-medium ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {loading ? 'Seeding Database...' : 'Seed Database with Sample Data'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="font-semibold">Success:</p>
          <p>{result.message}</p>
          <div className="mt-2">
            <p className="font-medium">Created courses:</p>
            <ul className="list-disc list-inside ml-2">
              {result.courses.map(course => (
                <li key={course.id}>
                  {course.title} (ID: {course.id})
                </li>
              ))}
            </ul>
          </div>
          {result.tags && (
            <div className="mt-2">
              <p className="font-medium">Created tags:</p>
              <ul className="list-disc list-inside ml-2">
                {result.tags.map(tag => (
                  <li key={tag.id} style={{ color: tag.color }}>
                    {tag.name} (ID: {tag.id})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatabaseSeeder;
