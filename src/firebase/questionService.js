import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where, serverTimestamp } from 'firebase/firestore';
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
    
    const newQuestion = {
      ...questionData,
      topics: topics || [],
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
    
    const questionRef = doc(db, COLLECTION_NAME, id);
    const updatedData = {
      ...questionData,
      topics: topics || [],
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
