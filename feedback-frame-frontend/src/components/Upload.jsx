import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../firebaseConfig'; // Adjust this path as needed
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Button, Card, CardHeader, CardBody, Image, CardFooter, Slider } from '@nextui-org/react';

function Uploads() {
  const [uploads, setUploads] = useState({});
  const [currentIndex, setCurrentIndex] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [collaborations, setCollaborations] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchCollaborations(user.uid);
      } else {
        setUploads({});
        setCollaborations([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchCollaborations = async (userId) => {
    const ownedCollabs = query(collection(firestore, "Collaborations Collection"), where("ownerId", "==", userId));
    const partOfCollabs = query(collection(firestore, "Collaborations Collection"), where("collaborators", "array-contains", userId));
    const ownedSnap = await getDocs(ownedCollabs);
    const partSnap = await getDocs(partOfCollabs);
    
    let collabIds = [];
    ownedSnap.forEach(doc => {
      collabIds.push(doc.id);
    });
    partSnap.forEach(doc => {
      if (!collabIds.includes(doc.id)) {
        collabIds.push(doc.id);
      }
    });
    setCollaborations(collabIds);
    await fetchUploadsForCollaborations(collabIds);
  };

  const fetchUploadsForCollaborations = async (collabIds) => {
    let uploadsData = {};
    for (let collabId of collabIds) {
      const q = query(collection(firestore, "uploads"), where("collabId", "==", collabId));
      const querySnapshot = await getDocs(q);
      uploadsData[collabId] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    setUploads(uploadsData);
    resetCurrentIndex(uploadsData);
  };

  const resetCurrentIndex = (uploadsData) => {
    let newIndices = {};
    Object.keys(uploadsData).forEach(collabId => {
      newIndices[collabId] = 0;
    });
    setCurrentIndex(newIndices);
  };

  const handleSliderChange = (collabId, value) => {
    setCurrentIndex(prevIndex => ({
      ...prevIndex,
      [collabId]: value,
    }));
  };

  const renderSlideshow = (collabId) => {
    const collabUploads = uploads[collabId] || [];
    return collabUploads.map((upload, index) => (
      <Card key={index}>
        <CardHeader>
          <h4>Uploaded by: {upload.userId}</h4>
        </CardHeader>
        <CardBody css={{ d: "flex", flexDirection: "row", alignItems: "center", gap: "20px" }}>
          <Slider
            size="sm"
            color="foreground"
            step={1}
            showMarkers={true}
            defaultValue={0}
            min={0}
            max={collabUploads.length - 1}
            value={currentIndex[collabId] || 0}
            onChange={(value) => handleSliderChange(collabId, value)}
          />
          <Image
            src={upload.preview} // Assuming 'preview' is the URL
            alt="Artwork preview"
            width={1000}
            height={1000}
          />
        </CardBody>
      </Card>
    ));
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexDirection: 'column' }}>
      {collaborations.map((collabId) => (
        <div key={collabId}>
          {/* Render slideshow for each collaboration */}
          {renderSlideshow(collabId)}
        </div>
      ))}
    </div>
  );
}

export default Uploads;
