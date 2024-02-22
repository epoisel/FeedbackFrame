import React, { useState, useEffect, useRef } from 'react';
import { firestore } from '../firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Button, Card, CardBody, Image, Slider } from '@nextui-org/react';
import UploadForm from './UploadForm';
import FabricCanvas from './FabricCanvas';

function CollaborationView({ collaborationId, onBack }) {
  const [userUploads, setUserUploads] = useState({});
  const [currentPreviewIndices, setCurrentPreviewIndices] = useState({});
  // Initialize an object to hold refs for each upload group
  const uploadRefs = useRef({}).current;

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

      const uploadsByUser = fetchedUploads.reduce((acc, upload) => {
        if (!uploadRefs[upload.userId]) {
          // Initialize a ref for each unique userId
          uploadRefs[upload.userId] = React.createRef();
        }
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

  const handleChange = (userId, value) => {
    setCurrentPreviewIndices(prev => ({
      ...prev,
      [userId]: Math.max(0, Math.min(value, (userUploads[userId] ? userUploads[userId].length : 1) - 1)),
    }));
  };

  return (
    <div>
      <Button auto flat color="error" onClick={onBack}>Go Back</Button>
      <UploadForm collabId={collaborationId} />
      {/* Flex container adjusted for responsive design */}
      <div className="flex flex-wrap justify-center md:justify-start gap-4">
        {Object.entries(userUploads).map(([userId, uploads]) => (
      // On small screens, take full width; on medium screens and above, take half the width.
        <div key={userId} className="p-2 w-full md:w-1/2">
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
                  <div className="relative aspect-w-16 aspect-h-9">
                    {/* Aspect ratio container for the canvas */}
                    <FabricCanvas imageUrl={uploads[currentPreviewIndices[userId]].artworkUrl} />
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CollaborationView;