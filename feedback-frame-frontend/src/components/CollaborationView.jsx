import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Slider, Card, CardBody, Image } from '@nextui-org/react';
import UploadForm from './UploadForm';
import Uploads from './Upload';

function CollaborationView({ collaborationId }) {
  const [previews, setPreviews] = useState([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [leftImageUrl, setLeftImageUrl] = useState('');
  const [rightImageUrl, setRightImageUrl] = useState('');

  // Fetch previews and most recent uploads based on the collaboration ID
  useEffect(() => {
    const fetchPreviews = async () => {
      const uploadsQuery = query(collection(firestore, "uploads"), where("collabId", "==", collaborationId));
      const querySnapshot = await getDocs(uploadsQuery);
      const fetchedPreviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPreviews(fetchedPreviews);

      // Assuming collaboration details include IDs of the starter and acceptor
      // Fetch the most recent upload for both
      const collabDetails = await getCollaborationDetails(collaborationId);
      if (collabDetails) {
        fetchMostRecentUpload(collabDetails.senderId, setLeftImageUrl);
        fetchMostRecentUpload(collabDetails.receiverId, setRightImageUrl);
      }
    };

    fetchPreviews();
  }, [collaborationId]);

  const getCollaborationDetails = async (collabId) => {
    // Placeholder for actual implementation
    // Fetch collaboration details to identify the starter and acceptor IDs
    return { senderId: '', receiverId: '' };
  };

  const fetchMostRecentUpload = async (userId, setImageUrl) => {
    const q = query(collection(firestore, "uploads"), where("userId", "==", userId), orderBy("timestamp", "desc"), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const mostRecentUpload = querySnapshot.docs[0].data();
      setImageUrl(mostRecentUpload.artworkUrl); // Assuming 'artworkUrl' is the field for the image URL
    }
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
  console.log("Passing collabId to UploadForm:", collaborationId);
  return (
    <div>
      <UploadForm collabId={collaborationId} />
      <Uploads collaborationId={collaborationId} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
        {leftImageUrl && <Image src={leftImageUrl} alt="Starter's Latest Upload" width={300} />}
        {rightImageUrl && <Image src={rightImageUrl} alt="Acceptor's Latest Upload" width={300} />}
      </div>
      {previews.length > 0 && (
        <Card>
          <CardBody>
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
            <img src={previews[currentPreviewIndex].previewUrl} alt="Preview" width="100%" />
            {/* Use appropriate method to format timestamp */}
            <p>{`Upload Date: ${new Date(previews[currentPreviewIndex].timestamp.seconds * 1000).toDateString()}`}</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default CollaborationView;
