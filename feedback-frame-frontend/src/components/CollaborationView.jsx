import React, { useState, useEffect } from 'react';
import { firestore } from './firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Slider, Card, Row } from '@nextui-org/react';
import UploadForm from './UploadForm';
import Uploads from './Upload';

function CollaborationView({ collaborationId }) {
  const [previews, setPreviews] = useState([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  // Fetch previews based on the collaboration ID
  useEffect(() => {
    const fetchPreviews = async () => {
      const q = query(collection(firestore, "uploads"), where("collabId", "==", collaborationId));
      const querySnapshot = await getDocs(q);
      const fetchedPreviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPreviews(fetchedPreviews);
    };

    fetchPreviews();
  }, [collaborationId]);

  const handleChange = (value) => {
    setCurrentPreviewIndex(value);
  };

  return (
    <div>
      <UploadForm collaborationId={collaborationId} />
      <Uploads collaborationId={collaborationId} />
      <Row justify="center" align="center">
        <Card css={{ mw: "600px" }}>
          <Card.Body>
            {previews.length > 0 && (
              <>
                <Slider
                  step={1}
                  min={0}
                  max={previews.length - 1}
                  value={currentPreviewIndex}
                  onChange={handleChange}
                />
                <img src={previews[currentPreviewIndex].previewUrl} alt="Preview" width="100%" />
                <div>{`Upload Date: ${previews[currentPreviewIndex].timestamp.toDate().toDateString()}`}</div>
              </>
            )}
          </Card.Body>
        </Card>
      </Row>
    </div>
  );
}

export default CollaborationView;