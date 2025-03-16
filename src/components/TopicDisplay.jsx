import React from 'react';
import PropTypes from 'prop-types';

const TopicDisplay = ({ topic, topics = [], onTopicClick, className = '' }) => {
  // If we have a single topic, display it
  if (topic) {
    return (
      <span
        onClick={onTopicClick ? () => onTopicClick(topic) : undefined}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 ${
          onTopicClick ? 'cursor-pointer hover:bg-gray-200' : ''
        } ${className}`}
      >
        {topic}
      </span>
    );
  }
  
  // If we have multiple topics, display them all
  if (topics && topics.length > 0) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {topics.map((t, index) => (
          <span
            key={index}
            onClick={onTopicClick ? () => onTopicClick(t) : undefined}
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 ${
              onTopicClick ? 'cursor-pointer hover:bg-gray-200' : ''
            }`}
          >
            {t}
          </span>
        ))}
      </div>
    );
  }
  
  return null;
};

TopicDisplay.propTypes = {
  topic: PropTypes.string,
  topics: PropTypes.arrayOf(PropTypes.string),
  onTopicClick: PropTypes.func,
  className: PropTypes.string
};

export default TopicDisplay;
