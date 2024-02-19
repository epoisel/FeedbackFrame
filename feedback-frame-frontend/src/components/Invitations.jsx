import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, setDoc, arrayUnion } from "firebase/firestore";
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

  const acceptInvitation = async (invite) => {
    // Extracting inviteId and senderId from the invite object
    const { id: inviteId, senderId, collaborationName } = invite;
  
    try {
      // Update the invitation status to 'accepted'
      await updateDoc(doc(firestore, "collaborationInvites", inviteId), { status: 'accepted' });
  
      // Assume senderId is available within the invite object for creating a collaboration
      // If senderId is not part of invite, you'll need to adjust accordingly
      const newCollabDocRef = doc(collection(firestore, "collaborations"));
      await setDoc(newCollabDocRef, {
        collabId: newCollabDocRef.id, // Ensuring collabId is set to the document's ID
        ownerId: senderId,
        collaborators: [
            senderId, // Directly using senderId as a string
            auth.currentUser.uid // Directly using current user's uid as a string
          ], // Correct structure for collaborators
        hasStarted: true,
        collaborationName: collaborationName
      });
  
      console.log("Collaboration initiated successfully");
      // Optionally update UI state to reflect the change
      setAcceptanceStatus(prevState => ({ ...prevState, [inviteId]: 'Accepted' }));
    } catch (error) {
      console.error("Error initiating collaboration:", error);
      // Optionally update UI state to indicate the error
      setAcceptanceStatus(prevState => ({ ...prevState, [inviteId]: 'Error' }));
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
