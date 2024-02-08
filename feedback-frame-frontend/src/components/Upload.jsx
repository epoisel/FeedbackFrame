import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Button, Card, CardHeader, CardBody, Image, CardFooter, ButtonGroup, Slider} from '@nextui-org/react';

function Uploads() {
  const [uploads, setUploads] = useState([]);
  const [currentIndex, setCurrentIndex] = useState({ 'User 1': 0, 'User 2': 0 });

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const response = await axios.get('http://localhost:3000/uploads');
        setUploads(response.data);
  
        // Construct a new currentIndex state
        const newUserIndices = response.data.reduce((acc, upload) => {
          acc[upload.user] = 0; // Initialize index for each user
          return acc;
        }, {});
  
        setCurrentIndex(newUserIndices); // Update the state once with the new indices
      } catch (error) {
        console.error('Error fetching uploads:', error);
      }
    };
    fetchUploads();
  }, []);
  

  // const goToNext = (user) => {
  //   setCurrentIndex(prevIndex => ({
  //     ...prevIndex,
  //     [user]: prevIndex[user] === uploads.filter(upload => upload.user === user).length - 1
  //       ? 0
  //       : prevIndex[user] + 1
  //   }));
  // };

  // const goToPrevious = (user) => {
  //   setCurrentIndex(prevIndex => ({
  //     ...prevIndex,
  //     [user]: prevIndex[user] === 0
  //       ? uploads.filter(upload => upload.user === user).length - 1
  //       : prevIndex[user] - 1
  //   }));
  // };

  const handleSliderChange = (user, value) => {
    setCurrentIndex(prevIndex => ({
      ...prevIndex,
      [user]: value,
    }));
  };


  const renderSlideshow = (user) => {
    const userUploads = uploads.filter(upload => upload.user === user);
    if (userUploads.length === 0) {
      return <div>No uploads found for {user}.</div>;
    }
    const safeIndex = Math.min(currentIndex[user], userUploads.length - 1);
    const currentUpload = userUploads[safeIndex];

    return (
      <Card>
        <CardHeader>
          <h4>Uploaded by: {user}</h4>
        </CardHeader>
        <CardBody css={{ d: "flex", flexDirection: user === 'User 1' ? "row" : "row-reverse", alignItems: "center", gap: "20px" }}>
          <Slider   
            size="sm"
            color="foreground"
            step={1}
            showMarkers={true}
            defaultValue={0}
            min={0}
            max={userUploads.length - 1}
            value={safeIndex}
            onChange={(value) => handleSliderChange(user, value)}
          />
          <Image
            src={`http://localhost:3000/uploads/${currentUpload.preview}`} 
            alt="Artwork preview"
            width={1000}
            height={1000}
            css={{  }}
          />
        </CardBody>
      </Card>
    );
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
      {['User 1', 'User 2'].map(user => (
        <div key={user}>
          {renderSlideshow(user)}
        </div>
      ))}
    </div>
  );
}

export default Uploads;
