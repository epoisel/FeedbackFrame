import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../firebaseConfig'; // Make sure this path is correct
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Button, Card, CardHeader, CardBody, Image, CardFooter, Slider} from '@nextui-org/react';

function Uploads() {
  const [uploads, setUploads] = useState([]);
  const [currentIndex, setCurrentIndex] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Listen for auth state changes to get the current user
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        fetchUploads(user.uid); // Use UID as the user identifier
      } else {
        setUploads([]); // Clear uploads if no user is signed in
      }
    });
    
    return () => unsubscribe(); // Clean up subscription
  }, []);

  const fetchUploads = async (userId) => {
    const q = query(collection(firestore, "uploads"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const uploadsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    setUploads(uploadsData);
    // Reset currentIndex for the new set of uploads
    const newIndices = uploadsData.reduce((acc, upload, index) => {
      acc[upload.userId] = 0; // Initialize at 0 for each user
      return acc;
    }, {});
    setCurrentIndex(newIndices);
  };

  const handleSliderChange = (userId, value) => {
    setCurrentIndex(prevIndex => ({
      ...prevIndex,
      [userId]: value,
    }));
  };

  const renderSlideshow = (userId) => {
    const userUploads = uploads.filter(upload => upload.userId === userId);
    if (userUploads.length === 0) {
      return <div>No uploads found.</div>;
    }
    const safeIndex = Math.min(currentIndex[userId] || 0, userUploads.length - 1);
    const currentUpload = userUploads[safeIndex];

    return (
      <Card>
        <CardHeader>
          <h4>Uploaded by: {userId}</h4>
        </CardHeader>
        <CardBody css={{ d: "flex", flexDirection: "row", alignItems: "center", gap: "20px" }}>
          <Slider   
            size="sm"
            color="foreground"
            step={1}
            showMarkers={true}
            defaultValue={0}
            min={0}
            max={userUploads.length - 1}
            value={safeIndex}
            onChange={(value) => handleSliderChange(userId, value)}
          />
          <Image
            src={currentUpload.preview} // Assuming 'preview' is the URL
            alt="Artwork preview"
            width={1000}
            height={1000}
          />
        </CardBody>
      </Card>
    );
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
      {/* Render slideshow for the current user only */}
      {currentUser && renderSlideshow(currentUser.uid)}
    </div>
  );
}

export default Uploads;