import { addCourse } from '../firebase/courseService';
import { addQuestion } from '../firebase/questionService';
import { addTag } from '../firebase/tagService';

// Function to seed the database
export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Create sample tags
    const tagData = [
      { name: 'Important', color: '#dc2626' }, // red
      { name: 'Review', color: '#f59e0b' },    // amber
      { name: 'Theory', color: '#9333ea' },    // violet
      { name: 'Practice', color: '#16a34a' },  // emerald
      { name: 'Interview', color: '#2563eb' }, // blue
      
      // Question types as tags
      { name: 'Concept', color: '#0891b2' },   // cyan
      { name: 'Implementation', color: '#db2777' }, // pink
      { name: 'Calculation', color: '#65a30d' }, // lime
      { name: 'Proof', color: '#4f46e5' },     // indigo
      { name: 'Analysis', color: '#ea580c' },  // orange
    ];
    
    const tags = [];
    const tagMap = {}; // Map tag names to their IDs for easy reference
    
    for (const tag of tagData) {
      const newTag = await addTag(tag);
      tags.push(newTag);
      tagMap[newTag.name] = newTag.id;
    }
    
    // Create sample courses
    const courseData = [
      {
        title: 'Algorithms',
        description: 'Comprehensive study of algorithms and data structures',
        color: '#4f46e5', // indigo
        topics: [
          'Matching Problems',
          'Graph Traversal',
          'Greedy Algorithms',
          'Divide and Conquer',
          'Dynamic Programming',
          'Network Flow'
        ]
      },
      {
        title: 'Probability',
        description: 'Fundamentals of probability theory and applications',
        color: '#16a34a', // emerald
        topics: [
          'Combinatorial Analysis',
          'Axioms of Probability',
          'Conditional Probability and Independence',
          'Random Variables',
          'Continuous Random Variables',
          'Jointly Distributed Random Variables',
          'Properties of Expectation',
          'Limit Theorems'
        ]
      }
    ];
    
    const courses = [];
    
    for (const course of courseData) {
      const newCourse = await addCourse({
        ...course,
        is_sample: true
      });
      courses.push(newCourse);
    }
    
    // Create sample questions for Algorithms course
    const algorithmsQuestions = [
      {
        title: 'Maximum Bipartite Matching',
        content: 'Explain the Ford-Fulkerson algorithm for finding maximum bipartite matching. What is the time complexity of this algorithm?',
        difficulty: 'medium',
        type: 'concept',
        topic: 'Matching Problems',
        tags: [tagMap['Concept'], tagMap['Theory'], tagMap['Interview']],
        estimated_time: 15
      },
      {
        title: 'DFS vs BFS',
        content: 'Compare and contrast Depth-First Search (DFS) and Breadth-First Search (BFS) graph traversal algorithms. When would you prefer one over the other?',
        difficulty: 'easy',
        type: 'concept',
        topic: 'Graph Traversal',
        tags: [tagMap['Concept'], tagMap['Important']],
        estimated_time: 10
      },
      {
        title: 'Dijkstra\'s Algorithm Implementation',
        content: 'Implement Dijkstra\'s algorithm to find the shortest path from a source vertex to all other vertices in a weighted graph. Use a priority queue for efficiency.',
        difficulty: 'hard',
        type: 'implementation',
        topic: 'Graph Traversal',
        tags: [tagMap['Implementation'], tagMap['Practice']],
        estimated_time: 25
      },
      {
        title: 'Fractional Knapsack Problem',
        content: 'Explain how to solve the Fractional Knapsack problem using a greedy approach. Provide an example and analyze the time complexity.',
        difficulty: 'medium',
        type: 'concept',
        topic: 'Greedy Algorithms',
        tags: [tagMap['Concept'], tagMap['Analysis']],
        estimated_time: 15
      },
      {
        title: 'Merge Sort Analysis',
        content: 'Analyze the time and space complexity of the Merge Sort algorithm. Explain why it\'s an example of the divide and conquer paradigm.',
        difficulty: 'medium',
        type: 'analysis',
        topic: 'Divide and Conquer',
        tags: [tagMap['Analysis'], tagMap['Theory']],
        estimated_time: 15
      },
      {
        title: 'Longest Common Subsequence',
        content: 'Implement a dynamic programming solution for finding the longest common subsequence of two strings. Analyze its time and space complexity.',
        difficulty: 'hard',
        type: 'implementation',
        topic: 'Dynamic Programming',
        tags: [tagMap['Implementation'], tagMap['Practice'], tagMap['Interview']],
        estimated_time: 20
      }
    ];
    
    // Create sample questions for Probability course
    const probabilityQuestions = [
      {
        title: 'Permutations and Combinations',
        content: 'Explain the difference between permutations and combinations. Provide formulas and examples for each.',
        difficulty: 'easy',
        type: 'concept',
        topic: 'Combinatorial Analysis',
        tags: [tagMap['Concept'], tagMap['Important']],
        estimated_time: 10
      },
      {
        title: 'Probability Axioms',
        content: 'State and explain the three axioms of probability. How do these axioms help us derive other probability rules?',
        difficulty: 'medium',
        type: 'theory',
        topic: 'Axioms of Probability',
        tags: [tagMap['Theory'], tagMap['Important']],
        estimated_time: 15
      },
      {
        title: 'Bayes\' Theorem Application',
        content: 'A medical test for a disease has a 98% true positive rate and a 3% false positive rate. If 2% of the population has the disease, what is the probability that a person who tests positive actually has the disease?',
        difficulty: 'hard',
        type: 'calculation',
        topic: 'Conditional Probability and Independence',
        tags: [tagMap['Calculation'], tagMap['Practice'], tagMap['Interview']],
        estimated_time: 20
      },
      {
        title: 'Expected Value Properties',
        content: 'Prove that the expected value of a sum of random variables equals the sum of their expected values, regardless of whether they are independent.',
        difficulty: 'medium',
        type: 'proof',
        topic: 'Properties of Expectation',
        tags: [tagMap['Proof'], tagMap['Theory']],
        estimated_time: 15
      },
      {
        title: 'Normal Distribution Properties',
        content: 'Explain the key properties of the normal distribution. Why is it so important in probability and statistics?',
        difficulty: 'medium',
        type: 'concept',
        topic: 'Continuous Random Variables',
        tags: [tagMap['Concept'], tagMap['Theory']],
        estimated_time: 15
      },
      {
        title: 'Central Limit Theorem',
        content: 'State the Central Limit Theorem and explain its significance in probability theory and statistics. Provide an example application.',
        difficulty: 'hard',
        type: 'theory',
        topic: 'Limit Theorems',
        tags: [tagMap['Theory'], tagMap['Important'], tagMap['Interview']],
        estimated_time: 20
      }
    ];
    
    // Add all questions to the database
    for (const question of [...algorithmsQuestions, ...probabilityQuestions]) {
      const courseId = question.topic.includes('Graph') || 
                      question.topic.includes('Matching') || 
                      question.topic.includes('Greedy') || 
                      question.topic.includes('Divide') || 
                      question.topic.includes('Dynamic') || 
                      question.topic.includes('Network') 
                      ? courses[0].id : courses[1].id;
      
      await addQuestion({
        ...question,
        course_id: courseId,
        answer: '', // Empty answer as requested
        is_sample: true
      });
    }
    
    return {
      message: 'Database seeded successfully with sample data!',
      courses,
      tags
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

export default seedDatabase;
