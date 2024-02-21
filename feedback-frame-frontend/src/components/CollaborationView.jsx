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
      <div className="flex flex-wrap justify-center gap-4">
        {Object.entries(userUploads).map(([userId, uploads]) => (
          <div key={userId} className="relative w-full md:w-[50%]" ref={uploadRefs[userId]}>
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
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                  <Image src={uploads[currentPreviewIndices[userId]].artworkUrl} alt="Artwork preview" width="100%" />
                  {/* Ensure FabricCanvas is positioned absolutely within CardBody */}
                  
                    <FabricCanvas containerRef={uploadRefs[userId]} />
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
