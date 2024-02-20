import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Button, Card, CardBody, Image, Slider } from '@nextui-org/react';
import UploadForm from './UploadForm';

function CollaborationView({ collaborationId, onBack }) {
  const [userUploads, setUserUploads] = useState({});
  const [currentPreviewIndices, setCurrentPreviewIndices] = useState({});

  // Function to fetch uploads for the collaboration, sorted by userId and timestamp
  useEffect(() => {
    const fetchUploads = async () => {
      const uploadsQuery = query(
        collection(firestore, "uploads"),
        where("collabId", "==", collaborationId),
        orderBy("userId"),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(uploadsQuery);
      const fetchedUploads = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Organize uploads by userId
      const uploadsByUser = fetchedUploads.reduce((acc, upload) => {
        (acc[upload.userId] = acc[upload.userId] || []).push(upload);
        return acc;
      }, {});

      setUserUploads(uploadsByUser);
      setCurrentPreviewIndices(
        Object.keys(uploadsByUser).reduce((acc, userId) => ({ ...acc, [userId]: 0 }), {})
      );
    };

    fetchUploads();
  }, [collaborationId]);

  // Function to handle slider change per user
  const handleChange = (userId, value) => {
    setCurrentPreviewIndices(prev => ({
      ...prev,
      [userId]: Math.max(0, Math.min(value, (userUploads[userId] ? userUploads[userId].length : 1) - 1)),
    }));
  };

  

  return (
    <div>
      <Button auto flat color="error" onClick={onBack}>
        Go Back
      </Button>

      {/* Pass collaborationId to UploadForm */}
      <UploadForm collabId={collaborationId} />

      {/* Iterate through each user's uploads to display their slideshows */}
      {Object.entries(userUploads).map(([userId, uploads]) => (
        <div key={userId} style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          {uploads.length > 0 && (
            <Card>
              <CardBody>
                <Slider
                  step={1}
                  min={0}
                  max={uploads.length - 1}
                  value={currentPreviewIndices[userId]}
                  onChange={(value) => handleChange(userId, value)}
                />
                <Image src={uploads[currentPreviewIndices[userId]].artworkUrl} alt="Artwork preview" width="100%" />
              </CardBody>
            </Card>
          )}
        </div>
      ))}
    </div>
  );
}

export default CollaborationView;
