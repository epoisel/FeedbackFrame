import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig';
import { collection, query, where, getDocs } from "firebase/firestore";
import { Card, CardBody, CardFooter, Image } from '@nextui-org/react';

function CollaborationCards({ userId, onSelectCollab }) {
  const [collaborations, setCollaborations] = useState([]);

  useEffect(() => {
    const fetchCollaborations = async () => {
      const q = query(collection(firestore, "collaborations"), where("collaborators", "array-contains", userId));
      const querySnapshot = await getDocs(q);
      const collaborationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Filter out the current user's name and join the remaining collaborator names
        collaboratorsNames: doc.data().collaborators
                                .filter(c => c.userId !== userId) // Exclude the current user
                                .map(c => c.name) // Extract the name
                                .join(', '), // Join names with comma
        collaborationName: doc.data().collaborationName,
      }));
      setCollaborations(collaborationsData);
    };
    fetchCollaborations();
  }, [userId]);

  const handleCardPress = (collabId) => {
    // Assuming onSelectCollab is a prop function passed down from the parent component
    onSelectCollab(collabId);
  };

  return (
    <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
      {collaborations.map((collab, index) => (
        <Card shadow="sm" key={index} isPressable onPress={() => handleCardPress(collab.id)}>
          <CardBody className="overflow-visible p-0">
            <Image
              shadow="sm"
              radius="lg"
              width="100%"
              alt={`Collaboration ${index + 1}`}
              src={collab.imageUrl || "path/to/default/image"} // Adjust path to dynamic or default image
              className="w-full object-cover h-[140px]"
            />
          </CardBody>
          <CardFooter className="text-small justify-between">
            <b>{collab.collaborationName}: {collab.collaboratorsNames}</b>
            <p className="text-default-500">Status: Active</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default CollaborationCards;
