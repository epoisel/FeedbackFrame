import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../firebaseConfig'; // Adjust this path as needed
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Button, Card, CardBody, Image, Slider } from '@nextui-org/react';

function Uploads() {
  const [uploads, setUploads] = useState({});
  const [currentIndex, setCurrentIndex] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [collaborations, setCollaborations] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        fetchCollaborations(user.uid);
      } else {
        setUploads({});
        setCollaborations([]);
        setCurrentIndex({});
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchCollaborations = async (userId) => {
    const collabsQuery = query(collection(firestore, "collaborationInvites"), where("receiverId", "==", userId));
    const collabsSnapshot = await getDocs(collabsQuery);
    let collabIds = collabsSnapshot.docs.map(doc => doc.data().collabId);
    setCollaborations(collabIds);
    fetchUploadsForCollaborations(collabIds);
  };

  const fetchUploadsForCollaborations = async (collabIds) => {
    if (!collabIds.length) return; // Ensure there are collabIds to query for
    let uploadsData = {};
    let newIndices = {};
    for (let collabId of collabIds) {
      if (!collabId) continue; // Skip undefined or invalid collabId
      const uploadsQuery = query(collection(firestore, "uploads"), where("collabId", "==", collabId));
      const uploadsSnapshot = await getDocs(uploadsQuery);
      uploadsData[collabId] = uploadsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      newIndices[collabId] = 0; // Initialize index for each collaboration
    }
    setUploads(uploadsData);
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
    if (collabUploads.length === 0) return null; // Early return if no uploads

    const upload = collabUploads[currentIndex[collabId]];
    return (
      <Card>
        <CardBody>
          <Slider
            size="sm"
            step={1}
            showMarkers={true}
            defaultValue={currentIndex[collabId]}
            min={0}
            max={collabUploads.length - 1}
            value={currentIndex[collabId]}
            onChange={(value) => handleSliderChange(collabId, value)}
          />
          <Image
            src={upload.previewUrl} // Ensure this matches your data field name
            alt="Artwork preview"
            width="100%"
          />
        </CardBody>
      </Card>
    );
  };

  return (
    <div>
      {collaborations.map(collabId => (
        <div key={collabId} style={{ marginBottom: '20px' }}>
          {renderSlideshow(collabId)}
        </div>
      ))}
    </div>
  );
}

export default Uploads;
