import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../firebaseConfig'; // Adjust import paths as necessary
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Card, Textarea, Button, Spacer } from '@nextui-org/react';

function Invitations() {
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    // Ensure there is a logged-in user
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Query for invitations where the current user is the receiver
    const q = query(collection(firestore, "collaborationInvites"), where("receiverId", "==", userId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const invites = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInvitations(invites);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  // Handle accepting an invitation
  const acceptInvitation = async (inviteId) => {
    try {
      // Update the invitation status to 'accepted'
      await updateDoc(doc(firestore, "collaborationInvites", inviteId), {
        status: 'accepted'
      });
      console.log("Invitation accepted successfully");
      // Further logic to handle post-acceptance actions (e.g., adding to collaborators)
    } catch (error) {
      console.error("Error accepting invitation: ", error);
    }
  };

  // Handle declining an invitation
  const declineInvitation = async (inviteId) => {
    try {
      // Update the invitation status to 'declined'
      await updateDoc(doc(firestore, "collaborationInvites", inviteId), {
        status: 'declined'
      });
      console.log("Invitation declined successfully");
    } catch (error) {
      console.error("Error declining invitation: ", error);
    }
  };

  return (
    <div>
      <Textarea h3>Invitations</Textarea>
      {invitations.length > 0 ? (
        invitations.map((invite) => (
          <Card key={invite.id} css={{ mb: '$5' }}>
            <Textarea isReadOnly
                label="Description"
                variant="bordered"
                labelPlacement="outside"
                placeholder="Enter your description"
                defaultValue="NextUI is a React UI library that provides a set of accessible, reusable, and beautiful components."
                className="max-w-xs"size={16}>
                    Invitation from user {invite.senderId} for upload {invite.uploadId}
            </Textarea>
            <Spacer y={0.5} />
            <Button auto color="primary" onClick={() => acceptInvitation(invite.id)}>Accept</Button>
            <Spacer x={0.5} inline />
            <Button auto color="error" onClick={() => declineInvitation(invite.id)}>Decline</Button>
          </Card>
        ))
      ) : (
        <Textarea>No invitations found.</Textarea>
      )}
    </div>
  );
}

export default Invitations;
