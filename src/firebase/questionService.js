import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from './config';

const COLLECTION_NAME = 'questions';

// Get all questions
export const getQuestions = async () => {
  try {
    const questionsCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(questionsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting questions:', error);
    throw error;
  }
};

// Get questions by course ID
export const getQuestionsByCourse = async (courseId) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("course_id", "==", courseId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting questions by course:', error);
    throw error;
  }
};

// Get questions by topic
export const getQuestionsByTopic = async (courseId, topic) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("course_id", "==", courseId),
      where("topic", "==", topic)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting questions by topic:', error);
    throw error;
  }
};

// Get questions by tag
export const getQuestionsByTag = async (tagId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("tags", "array-contains", tagId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting questions by tag:', error);
    throw error;
  }
};

// Get a single question by ID
export const getQuestionById = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting question:', error);
    throw error;
  }
};

// Add a new question
export const addQuestion = async (questionData) => {
  try {
    // Parse topics if it's a string
    let topics = questionData.topics;
    if (typeof topics === 'string') {
      try {
        topics = JSON.parse(topics);
      } catch (e) {
        topics = [];
      }
    }
    
    // Ensure tags is an array
    let tags = questionData.tags || [];
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        tags = [];
      }
    }
    
    const newQuestion = {
      ...questionData,
      topics: topics || [],
      tags: tags || [],
      created_date: serverTimestamp(),
      updated_date: serverTimestamp(),
      is_sample: false
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newQuestion);
    return {
      id: docRef.id,
      ...newQuestion
    };
  } catch (error) {
    console.error('Error adding question:', error);
    throw error;
  }
};

// Update a question
export const updateQuestion = async (id, questionData) => {
  try {
    // Parse topics if it's a string
    let topics = questionData.topics;
    if (typeof topics === 'string') {
      try {
        topics = JSON.parse(topics);
      } catch (e) {
        topics = [];
      }
    }
    
    // Ensure tags is an array
    let tags = questionData.tags || [];
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        tags = [];
      }
    }
    
    const questionRef = doc(db, COLLECTION_NAME, id);
    const updatedData = {
      ...questionData,
      topics: topics || [],
      tags: tags || [],
      updated_date: serverTimestamp()
    };
    
    await updateDoc(questionRef, updatedData);
    return {
      id,
      ...updatedData
    };
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

// Delete a question
export const deleteQuestion = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return id;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

/**
 * Get questions filtered by various criteria
 * @param {Object} filters - Filter criteria
 * @param {string} [filters.courseId] - Course ID to filter by
 * @param {string} [filters.topic] - Topic to filter by
 * @param {string} [filters.difficulty] - Difficulty level to filter by
 * @param {Array<string>} [filters.tagIds] - Array of tag IDs to filter by
 * @returns {Promise<Array>} - Array of question objects
 */
export const getQuestionsByFilters = async (filters = {}) => {
  try {
    const { courseId, topic, difficulty, tagIds } = filters;
    
    // Start with a base query on the collection
    let q = collection(db, COLLECTION_NAME);
    let constraints = [];
    
    // Add filters based on provided criteria
    if (courseId) {
      constraints.push(where("course_id", "==", courseId));
    }
    
    if (topic) {
      constraints.push(where("topic", "==", topic));
    }
    
    if (difficulty) {
      constraints.push(where("difficulty", "==", difficulty));
    }
    
    // Apply the constraints to the query
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    
    // Execute the query
    const snapshot = await getDocs(q);
    let questions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter by tags if specified (this needs to be done client-side because Firestore
    // doesn't support array-contains-any with multiple array-contains conditions)
    if (tagIds && tagIds.length > 0) {
      questions = questions.filter(question => {
        // If the question has no tags, it doesn't match
        if (!question.tags || !Array.isArray(question.tags)) {
          return false;
        }
        
        // Check if the question has at least one of the specified tags
        return tagIds.some(tagId => question.tags.includes(tagId));
      });
    }
    
    return questions;
  } catch (error) {
    console.error("Error getting questions by filters:", error);
    throw error;
  }
};

/**
 * Delete all questions from the database
 * @returns {Promise<void>}
 */
export const deleteAllQuestions = async () => {
  try {
    const batch = writeBatch(db);
    const questionsRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(questionsRef);
    
    if (snapshot.empty) {
      return;
    }
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Deleted ${snapshot.size} questions`);
  } catch (error) {
    console.error("Error deleting all questions:", error);
    throw error;
  }
};
