import { addCourse } from '../firebase/courseService';
import { addQuestion } from '../firebase/questionService';

// Sample courses data
const sampleCourses = [
  {
    title: "Algorithms",
    description: "Fundamental algorithms and data structures for computer science",
    color: "#4F46E5" // Indigo
  },
  {
    title: "Probability",
    description: "Mathematical foundations of probability theory and statistics",
    color: "#10B981" // Emerald
  }
];

// Sample questions for Algorithms
const algorithmQuestions = [
  {
    title: "Big O Notation",
    content: "Explain the difference between O(n) and O(n²) time complexity with examples.",
    answer: "O(n) means the algorithm's runtime grows linearly with input size. Example: Simple search through an array.\n\nO(n²) means the runtime grows quadratically with input size. Example: Nested loops where for each element, you process all elements again (like bubble sort).\n\nO(n) is generally more efficient than O(n²) for large inputs.",
    difficulty: "medium",
    type: "concept",
    estimated_time: 5,
    topics: ["time complexity", "algorithm analysis"]
  },
  {
    title: "Binary Search Implementation",
    content: "Write a binary search algorithm to find an element in a sorted array. Analyze its time complexity.",
    answer: "```javascript\nfunction binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  \n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    \n    if (arr[mid] === target) {\n      return mid;\n    } else if (arr[mid] < target) {\n      left = mid + 1;\n    } else {\n      right = mid - 1;\n    }\n  }\n  \n  return -1; // Element not found\n}\n```\n\nTime Complexity: O(log n) - Each iteration eliminates half of the remaining elements.",
    difficulty: "hard",
    type: "implementation",
    estimated_time: 10,
    topics: ["binary search", "divide and conquer", "searching algorithms"]
  },
  {
    title: "Linked List vs Array",
    content: "Compare and contrast linked lists and arrays. When would you choose one over the other?",
    answer: "Arrays:\n- Contiguous memory allocation\n- Constant-time access to elements by index O(1)\n- Insertion/deletion in middle is O(n) due to shifting\n- Fixed size in some languages\n\nLinked Lists:\n- Non-contiguous memory allocation\n- O(n) access time to find an element\n- Constant-time insertion/deletion when position is known O(1)\n- Dynamic size\n\nChoose arrays when:\n- Random access is frequent\n- Size is known and fixed\n- Memory efficiency is important\n\nChoose linked lists when:\n- Frequent insertions/deletions\n- Size is unknown or changes frequently\n- Memory fragmentation is a concern",
    difficulty: "easy",
    type: "concept",
    estimated_time: 5,
    topics: ["data structures", "linked lists", "arrays"]
  }
];

// Sample questions for Probability
const probabilityQuestions = [
  {
    title: "Bayes' Theorem",
    content: "Explain Bayes' Theorem and provide a real-world example of its application.",
    answer: "Bayes' Theorem: P(A|B) = [P(B|A) × P(A)] / P(B)\n\nIt describes the probability of an event based on prior knowledge of conditions related to the event.\n\nReal-world example: Medical testing\nIf a disease affects 1% of the population (P(D) = 0.01) and a test is 95% accurate for positive cases (P(+|D) = 0.95) but has a 5% false positive rate (P(+|not D) = 0.05), then the probability that someone with a positive test actually has the disease is:\n\nP(D|+) = [P(+|D) × P(D)] / P(+)\nP(D|+) = [0.95 × 0.01] / [0.95 × 0.01 + 0.05 × 0.99]\nP(D|+) ≈ 0.16 or 16%\n\nThis demonstrates why positive test results for rare conditions often require follow-up testing.",
    difficulty: "hard",
    type: "concept",
    estimated_time: 8,
    topics: ["conditional probability", "bayes theorem"]
  },
  {
    title: "Expected Value",
    content: "Define expected value and calculate the expected value of rolling a fair six-sided die.",
    answer: "Expected value is the long-run average value of a random variable over many repeated trials.\n\nFor a discrete random variable X with possible values x₁, x₂, ..., xₙ and corresponding probabilities p₁, p₂, ..., pₙ, the expected value is:\n\nE(X) = x₁p₁ + x₂p₂ + ... + xₙpₙ\n\nFor a fair six-sided die, each face has probability 1/6:\n\nE(X) = 1(1/6) + 2(1/6) + 3(1/6) + 4(1/6) + 5(1/6) + 6(1/6)\nE(X) = (1 + 2 + 3 + 4 + 5 + 6)/6\nE(X) = 21/6 = 3.5",
    difficulty: "medium",
    type: "calculation",
    estimated_time: 5,
    topics: ["expected value", "discrete probability"]
  },
  {
    title: "Probability Distributions",
    content: "Compare and contrast binomial, Poisson, and normal distributions. Provide examples of when each would be used.",
    answer: "Binomial Distribution:\n- Models number of successes in n independent trials with probability p\n- Discrete distribution\n- Example: Number of heads in 10 coin flips\n\nPoisson Distribution:\n- Models number of events in a fixed interval when events occur independently at a constant rate\n- Discrete distribution\n- Example: Number of emails received per hour\n\nNormal Distribution:\n- Bell-shaped, symmetric distribution defined by mean and standard deviation\n- Continuous distribution\n- Example: Heights of adult humans, measurement errors\n\nUse binomial when: counting successes in fixed number of trials\nUse Poisson when: counting rare events in time/space intervals\nUse normal when: modeling natural phenomena, approximating other distributions (via Central Limit Theorem)",
    difficulty: "hard",
    type: "concept",
    estimated_time: 10,
    topics: ["probability distributions", "statistics"]
  }
];

// Function to seed the database
export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Add courses
    const algorithmsPromise = addCourse(sampleCourses[0]);
    const probabilityPromise = addCourse(sampleCourses[1]);
    
    const [algorithmsCourse, probabilityCourse] = await Promise.all([
      algorithmsPromise,
      probabilityPromise
    ]);
    
    console.log('Courses added:', algorithmsCourse.id, probabilityCourse.id);
    
    // Add questions for Algorithms
    const algorithmQuestionsPromises = algorithmQuestions.map(question => 
      addQuestion({
        ...question,
        course_id: algorithmsCourse.id
      })
    );
    
    // Add questions for Probability
    const probabilityQuestionsPromises = probabilityQuestions.map(question => 
      addQuestion({
        ...question,
        course_id: probabilityCourse.id
      })
    );
    
    // Wait for all questions to be added
    await Promise.all([
      ...algorithmQuestionsPromises,
      ...probabilityQuestionsPromises
    ]);
    
    console.log('Database seeding completed successfully!');
    return {
      courses: [algorithmsCourse, probabilityCourse],
      message: 'Database seeded successfully with sample courses and questions!'
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

export default seedDatabase;
