import React from 'react';
import PropTypes from 'prop-types';

const TagDisplay = ({ tags, onTagClick, className = '' }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <span
          key={tag.id}
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            onTagClick ? 'cursor-pointer hover:opacity-80' : ''
          }`}
          style={{
            backgroundColor: tag.color || '#4f46e5',
            color: getContrastColor(tag.color || '#4f46e5')
          }}
        >
          {tag.name}
        </span>
      ))}
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

TagDisplay.propTypes = {
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string
    })
  ),
  onTagClick: PropTypes.func,
  className: PropTypes.string
};

export default TagDisplay;
