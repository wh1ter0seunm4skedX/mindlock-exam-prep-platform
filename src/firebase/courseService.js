import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

const COLLECTION_NAME = 'courses';

// Get all courses
export const getCourses = async () => {
  try {
    const coursesCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(coursesCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting courses:', error);
    throw error;
  }
};

// Get a single course by ID
export const getCourseById = async (id) => {
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
    console.error('Error getting course:', error);
    throw error;
  }
};

// Add a new course
export const addCourse = async (courseData) => {
  try {
    const newCourse = {
      ...courseData,
      created_date: serverTimestamp(),
      updated_date: serverTimestamp(),
      is_sample: false
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newCourse);
    return {
      id: docRef.id,
      ...newCourse
    };
  } catch (error) {
    console.error('Error adding course:', error);
    throw error;
  }
};

// Update a course
export const updateCourse = async (id, courseData) => {
  try {
    const courseRef = doc(db, COLLECTION_NAME, id);
    const updatedData = {
      ...courseData,
      updated_date: serverTimestamp()
    };
    
    await updateDoc(courseRef, updatedData);
    return {
      id,
      ...updatedData
    };
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

// Delete a course
export const deleteCourse = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return id;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};
