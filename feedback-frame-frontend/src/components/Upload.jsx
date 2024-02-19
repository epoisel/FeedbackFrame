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
      console.log("Auth state changed, user:", user);
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
    // Fetch collaborations where the user is the owner
    const ownedCollabsQuery = query(collection(firestore, "collaborations"), where("ownerId", "==", userId));
    const ownedCollabsSnapshot = await getDocs(ownedCollabsQuery);
  
    // Fetch collaborations where the user is a collaborator
    const partOfCollabsQuery = query(collection(firestore, "collaborations"), where("collaborators", "array-contains", userId));
    const partOfCollabsSnapshot = await getDocs(partOfCollabsQuery);
  
    // Combine the IDs from both queries, avoiding duplicates
    let collabIds = new Set();
    ownedCollabsSnapshot.forEach(doc => {
      collabIds.add(doc.id);
    });
    partOfCollabsSnapshot.forEach(doc => {
      collabIds.add(doc.id);
    });
  
    // Convert Set back to Array for further processing
    collabIds = Array.from(collabIds);
    console.log("Fetched collaboration IDs:", collabIds);
  
    setCollaborations(collabIds);
    fetchUploadsForCollaborations(collabIds);
  };

  const fetchUploadsForCollaborations = async (collabIds) => {
    if (!collabIds.length) {
      console.log("No collaboration IDs to fetch uploads for.");
      return;
    }
    let uploadsData = {};
    let newIndices = {};
    for (let collabId of collabIds) {
      if (!collabId) continue; // Skip undefined or invalid collabId
      const uploadsQuery = query(collection(firestore, "uploads"), where("collabId", "==", collabId));
      const uploadsSnapshot = await getDocs(uploadsQuery);
      uploadsData[collabId] = uploadsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      newIndices[collabId] = 0; // Initialize index for each collaboration
    }
    console.log("Fetched uploads data:", uploadsData);
    setUploads(uploadsData);
    setCurrentIndex(newIndices);
  };

  const handleSliderChange = (collabId, value) => {
    console.log(`Slider value changed for ${collabId}:`, value);
    setCurrentIndex(prevIndex => ({
      ...prevIndex,
      [collabId]: value,
    }));
  };

  const renderSlideshow = (collabId) => {
    const collabUploads = uploads[collabId] || [];
    if (collabUploads.length === 0) {
      console.log(`No uploads for collaboration: ${collabId}`);
      return null; // Early return if no uploads
    }

    const upload = collabUploads[currentIndex[collabId]];
    console.log(`Rendering slideshow for ${collabId}, upload:`, upload);
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
