import React, { useState } from 'react';
import './Upload.css'; // Import your CSS file

function Uploads({ uploads }) {
  const [currentIndex, setCurrentIndex] = useState({});

  const goToNext = (user) => {
    setCurrentIndex(prevIndex => ({
      ...prevIndex,
      [user]: prevIndex[user] === uploads.filter(upload => upload.user === user).length - 1
        ? 0
        : prevIndex[user] + 1
    }));
  };

  const goToPrevious = (user) => {
    setCurrentIndex(prevIndex => ({
      ...prevIndex,
      [user]: prevIndex[user] === 0
        ? uploads.filter(upload => upload.user === user).length - 1
        : prevIndex[user] - 1
    }));
  };

  const renderSlideshow = (user) => (
    <div className="slideshow">
      <button onClick={() => goToPrevious(user)}>Previous</button>
      <img src={`http://localhost:3000/uploads/${uploads.find(upload => upload.user === user).preview}`} alt="Artwork preview" style={{ width: '50%', height: 'auto' }} />
      <button onClick={() => goToNext(user)}>Next</button>
    </div>
  );

  return (
    <div className="uploads-container">
      {uploads.map(upload => (
        <div key={upload.user} className={`user-slideshow ${upload.user === 'User 1' ? 'left' : 'right'}`}>
          <h2>Uploaded by: {upload.user}</h2>
          {renderSlideshow(upload.user)}
        </div>
      ))}
    </div>
  );
}

export default Uploads;
