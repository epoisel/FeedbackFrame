import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { firestore } from './firebase'; // Adjust the import path as necessary
import { collection, query, where, getDocs } from "firebase/firestore";
import { Button, Card, CardHeader, CardBody, Image, CardFooter, ButtonGroup, Slider} from '@nextui-org/react';

function Uploads() {
  const [uploads, setUploads] = useState([]);
  const [currentIndex, setCurrentIndex] = useState({ 'User 1': 0, 'User 2': 0 });

  useEffect(() => {
    const fetchUploads = async () => {
      const q = query(collection(firestore, "uploads"), where("user", "==", user)); // Adjust based on how you manage users
      const querySnapshot = await getDocs(q);
      const uploadsData = querySnapshot.docs.map(doc => doc.data());
      setUploads(uploadsData);
    };
    
    fetchUploads();
  }, []);

 

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
