import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { Card, Button, Spacer } from '@nextui-org/react';

function Invitations() {
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Adjusted query to include only pending invitations
    const q = query(
      collection(firestore, "collaborationInvites"), 
      where("receiverId", "==", userId),
      where("status", "==", "pending") // Only fetch invitations that are still pending
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const invites = querySnapshot.docs.map(doc => {
        const invite = doc.data();
        return {
          id: doc.id,
          ...invite,
          senderName: invite.senderName, 
          collaborationName: invite.collaborationName, 
        };
      });
      setInvitations(invites);
    });

    return () => unsubscribe();
  }, []);

  const acceptInvitation = async (invite) => {
    // Accept invitation logic remains the same
  };

  const handleDecline = async (inviteId) => {
    // Logic to update the invitation's status to 'declined'
    try {
      await updateDoc(doc(firestore, "collaborationInvites", inviteId), {
        status: 'declined'
      });
      console.log("Invitation declined successfully.");
    } catch (error) {
      console.error("Error declining invitation: ", error);
    }
  };

  return (
    <div>
      <h3>Invitations</h3>
      {invitations.length > 0 ? invitations.map((invite) => (
        <Card key={invite.id}>
          <div>Invitation from {invite.senderName} for "{invite.collaborationName}"</div>
          <Spacer y={0.5} />
          <Button onClick={() => acceptInvitation(invite)}>Accept</Button>
          <Button onClick={() => handleDecline(invite.id)}>Decline</Button>
        </Card>
      )) : <Text>No pending invitations.</Text>}
    </div>
  );
}

export default Invitations;
