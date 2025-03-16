import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { addTag, updateTag, deleteTag, getTags } from '../firebase/tagService';

const TagManager = ({ selectedTags = [], onChange, className = '', showControls = false }) => {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', color: '#4f46e5' });
  const [editingTagId, setEditingTagId] = useState(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setIsLoading(true);
      const fetchedTags = await getTags();
      setTags(fetchedTags);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('Failed to load tags');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (tag = null) => {
    if (tag) {
      setFormData({ name: tag.name, color: tag.color });
      setEditingTagId(tag.id);
    } else {
      setFormData({ name: '', color: '#4f46e5' });
      setEditingTagId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', color: '#4f46e5' });
    setEditingTagId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Tag name is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      if (editingTagId) {
        const updatedTag = await updateTag(editingTagId, formData);
        setTags(prev => prev.map(tag => 
          tag.id === editingTagId ? updatedTag : tag
        ));
      } else {
        const newTag = await addTag(formData);
        setTags(prev => [...prev, newTag]);
      }
      
      handleCloseModal();
    } catch (err) {
      console.error('Error saving tag:', err);
      setError('Failed to save tag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tag? It will be removed from all questions that use it.')) {
      try {
        setIsLoading(true);
        await deleteTag(id);
        setTags(tags.filter(tag => tag.id !== id));
        
        // If the deleted tag was selected, remove it from selection
        if (selectedTags.includes(id)) {
          const newSelectedTags = selectedTags.filter(tagId => tagId !== id);
          onChange(newSelectedTags);
        }
      } catch (err) {
        console.error('Error deleting tag:', err);
        setError('Failed to delete tag');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTagSelection = (tagId) => {
    let newSelectedTags;
    
    if (selectedTags.includes(tagId)) {
      newSelectedTags = selectedTags.filter(id => id !== tagId);
    } else {
      newSelectedTags = [...selectedTags, tagId];
    }
    
    onChange(newSelectedTags);
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
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">Tags</h3>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs mb-3" role="alert">
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center my-2">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="ml-2 text-xs text-gray-600">Loading...</span>
        </div>
      )}

      <div className="bg-gray-50 p-3 rounded-md">
        {tags.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">No tags available. Create your first tag.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center">
                <span
                  onClick={() => handleTagSelection(tag.id)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                    selectedTags.includes(tag.id) ? 'ring-2 ring-offset-2 ring-gray-500' : ''
                  }`}
                  style={{
                    backgroundColor: tag.color,
                    color: getContrastColor(tag.color)
                  }}
                >
                  {tag.name}
                </span>
                {showControls && (
                  <div className="flex ml-1">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(tag)}
                      className="text-gray-400 hover:text-gray-500 p-1"
                    >
                      <PencilIcon className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tag.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for adding/editing tags */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingTagId ? 'Edit Tag' : 'Add New Tag'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter tag name"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
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
                          className="h-6 w-6 rounded-full border border-black border-opacity-10"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {editingTagId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to determine text color based on background color
const getContrastColor = (hexColor) => {
  // Remove the hash if it exists
  hexColor = hexColor.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

TagManager.propTypes = {
  selectedTags: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  showControls: PropTypes.bool
};

export default TagManager;
