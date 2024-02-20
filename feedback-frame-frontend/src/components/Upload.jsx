import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../firebaseConfig'; // Adjust this path as needed
import { collection, query, where, getDoc, getDocs, doc, orderBy, limit  } from "firebase/firestore";
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
    let uploadsData = {};
    for (let collabId of collabIds) {
      const collabDocRef = doc(firestore, "collaborations", collabId);
      const collabDocSnap = await getDoc(collabDocRef);
      if (!collabDocSnap.exists()) continue; // Skip if collaboration doesn't exist
      const collabData = collabDocSnap.data();
      const participantIds = [collabData.ownerId, ...(collabData.collaborators || [])];
  
      uploadsData[collabId] = {}; // Prepare to store uploads by user ID
  
      for (let userId of participantIds) {
        const uploadsQuery = query(collection(firestore, "uploads"), where("userId", "==", userId), where("collabId", "==", collabId), orderBy("timestamp", "desc"), limit(1));
        const uploadsSnapshot = await getDocs(uploadsQuery);
        if (!uploadsSnapshot.empty) {
          const mostRecentUpload = uploadsSnapshot.docs[0].data();
          // Store each user's most recent upload separately
          uploadsData[collabId][userId] = mostRecentUpload;
        }
      }
    }
  
    setUploads(uploadsData);
    // Initialize currentIndex for each collaboration with at least one upload
    const newIndices = Object.keys(uploadsData).reduce((acc, collabId) => {
      acc[collabId] = Object.keys(uploadsData[collabId]).reduce((acc, userId) => {
        acc[userId] = 0; // Initialize index for each user
        return acc;
      }, {});
      return acc;
    }, {});
    setCurrentIndex(newIndices);
  };

  const handleSliderChange = (collabId, userId, value) => {
    // Log the slider value change for debugging
    console.log(`Slider value changed for ${collabId}, user ${userId}:`, value);
  
    // Update the currentIndex state to reflect the new slider position
    // Ensure we safely update the state to avoid crashes for non-existent indexes
    setCurrentIndex(prevIndex => ({
      ...prevIndex,
      [collabId]: {
        ...prevIndex[collabId],
        [userId]: Math.max(0, Math.min(value, (uploads[collabId][userId] ? uploads[collabId][userId].length : 0) - 1)) // Safeguard against out-of-bounds
      },
    }));
  };

  const renderSlideshow = (collabId) => {
    const collabUploads = uploads[collabId] || {};
    const userIds = Object.keys(collabUploads);
    if (userIds.length === 0) {
      return null; // Early return if no uploads
    }
  
    return userIds.map(userId => {
      const upload = collabUploads[userId];
      return (
        <Card key={userId}>
          <CardBody>
            <Image
              src={upload.previewUrl} // Ensure this matches your data field name
              alt="Artwork preview"
              width="100%"
            />
            {/* Adjust slider and metadata rendering as needed */}
          </CardBody>
          <Slider
  size="sm"
  step={1}
  showMarkers={true}
  defaultValue={0} // Start with the first upload
  min={0}
  max={(uploads[collabId][userId] ? uploads[collabId][userId].length : 1) - 1} // Adjust based on the number of uploads for this user
  value={currentIndex[collabId] && currentIndex[collabId][userId] ? currentIndex[collabId][userId] : 0}
  onChange={(value) => handleSliderChange(collabId, userId, value)}
/>
        </Card>
      );
    });
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
