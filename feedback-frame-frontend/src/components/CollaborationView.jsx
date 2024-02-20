import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Slider, Card, CardBody, Image } from '@nextui-org/react';

function CollaborationView({ collaborationId }) {
  const [userUploads, setUserUploads] = useState({}); // Stores uploads separated by user
  const [currentPreviewIndices, setCurrentPreviewIndices] = useState({}); // Index for each user's slideshow

  useEffect(() => {
    const fetchUploads = async () => {
      const uploadsQuery = query(collection(firestore, "uploads"), where("collabId", "==", collaborationId), orderBy("userId"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(uploadsQuery);
      const fetchedUploads = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Separate uploads by user
      const uploadsByUser = fetchedUploads.reduce((acc, upload) => {
        (acc[upload.userId] = acc[upload.userId] || []).push(upload);
        return acc;
      }, {});

      setUserUploads(uploadsByUser);
      setCurrentPreviewIndices(Object.keys(uploadsByUser).reduce((acc, userId) => ({ ...acc, [userId]: 0 }), {}));
    };

    fetchUploads();
  }, [collaborationId]);

  const handleChange = (userId, value) => {
    setCurrentPreviewIndices(prev => ({
      ...prev,
      [userId]: Math.max(0, Math.min(value, (userUploads[userId] ? userUploads[userId].length : 1) - 1)),
    }));
  };

  return (
    <div>
      {Object.entries(userUploads).map(([userId, uploads]) => (
        <div key={userId} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
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
                  {/* Display additional upload metadata as needed */}
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CollaborationView;
