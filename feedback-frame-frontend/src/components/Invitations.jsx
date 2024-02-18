import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { Card, Button, Spacer } from '@nextui-org/react';

function Invitations() {
    const [invitations, setInvitations] = useState([]);
    const [acceptanceStatus, setAcceptanceStatus] = useState({});

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

  const acceptInvitation = async (inviteId, senderId) => {
    try {
      // Update the invitation status to 'accepted'
      await updateDoc(doc(firestore, "collaborationInvites", inviteId), { status: 'accepted' });
  
      // Create a new collaboration document without the need for an uploadId initially
      const newCollabDocRef = doc(collection(firestore, "collaborations"));
      await setDoc(newCollabDocRef, {
        ownerId: senderId,
        collaborators: [senderId, auth.currentUser.uid], // Include both the sender and receiver as collaborators
        // No uploadId initially. Can be added later when the collaboration has a specific upload to discuss or work on
        hasStarted: false // This field can indicate that the collaboration is ready but not yet tied to a specific upload
      });
  
      console.log("Collaboration initiated successfully");
      setAcceptanceStatus(prevState => ({...prevState, [inviteId]: 'Accepted'}));
    } catch (error) {
        console.error("Error initiating collaboration: ", error);
        setAcceptanceStatus(prevState => ({...prevState, [inviteId]: 'Error'}));
    }
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
      )) : <div>No pending invitations.</div>}
    </div>
  );
}

export default Invitations;
