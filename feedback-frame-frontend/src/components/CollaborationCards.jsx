import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig';
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardFooter, Image } from '@nextui-org/react';

function CollaborationCards({ userId }) {
  const [collaborations, setCollaborations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollaborations = async () => {
      const q = query(collection(firestore, "collaborations"), where("collaborators", "array-contains", userId));
      const querySnapshot = await getDocs(q);
      setCollaborations(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchCollaborations();
  }, [userId]);

  const handleCardPress = (collabId) => {
    navigate(`/collaboration/${collabId}`);
  };

  return (
    <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
      {collaborations.map((collab, index) => (
        <Card shadow="sm" key={index} isPressable onPress={() => handleCardPress(collab.id)}>
          <CardBody className="overflow-visible p-0">
            {/* Placeholder for an image - adjust as needed */}
            <Image
              shadow="sm"
              radius="lg"
              width="100%"
              alt={`Collaboration ${index + 1}`}
              className="w-full object-cover h-[140px]"
              src="path/to/your/collaboration/image/or/icon" // Adjust or dynamically set per collaboration
            />
          </CardBody>
          <CardFooter className="text-small justify-between">
            <b>{`Collaboration with ${collab.collaborators.filter(id => id !== userId).join(', ')}`}</b>
            {/* Example placeholder - adjust content as needed */}
            <p className="text-default-500">Status: Active</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default CollaborationCards;
