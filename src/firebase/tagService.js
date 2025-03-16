import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

const COLLECTION_NAME = 'tags';

// Get all tags
export const getTags = async () => {
  try {
    const tagsCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(tagsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting tags:', error);
    throw error;
  }
};

// Get a single tag by ID
export const getTagById = async (id) => {
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
    console.error('Error getting tag:', error);
    throw error;
  }
};

// Get multiple tags by IDs
export const getTagsByIds = async (tagIds) => {
  try {
    if (!tagIds || tagIds.length === 0) {
      return [];
    }
    
    const tags = [];
    for (const tagId of tagIds) {
      const tag = await getTagById(tagId);
      if (tag) {
        tags.push(tag);
      }
    }
    
    return tags;
  } catch (error) {
    console.error('Error getting tags by IDs:', error);
    throw error;
  }
};

// Add a new tag
export const addTag = async (tagData) => {
  try {
    const newTag = {
      ...tagData,
      created_date: serverTimestamp(),
      updated_date: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newTag);
    return {
      id: docRef.id,
      ...newTag
    };
  } catch (error) {
    console.error('Error adding tag:', error);
    throw error;
  }
};

// Update a tag
export const updateTag = async (id, tagData) => {
  try {
    const tagRef = doc(db, COLLECTION_NAME, id);
    const updatedData = {
      ...tagData,
      updated_date: serverTimestamp()
    };
    
    await updateDoc(tagRef, updatedData);
    return {
      id,
      ...updatedData
    };
  } catch (error) {
    console.error('Error updating tag:', error);
    throw error;
  }
};

// Delete a tag
export const deleteTag = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return id;
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
};
