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
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const invitesData = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const invite = { id: doc.id, ...doc.data() };
        // Fetch sender's details
        const senderDoc = await getDoc(doc(firestore, "users", invite.senderId));
        if (senderDoc.exists()) {
          const senderData = senderDoc.data();
          return { ...invite, senderName: senderData.name || senderData.email }; // Prefer name, fallback to email
        }
        return invite;
      }));
      setInvitations(invitesData);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  const acceptInvitation = async (inviteId) => {
    try {
      // Accept the invitation
      await updateDoc(doc(firestore, "collaborationInvites", inviteId), {
        status: 'accepted'
      });
      console.log("Invitation accepted successfully");
      // Implement logic for starting/joining a collaboration here
    } catch (error) {
      console.error("Error accepting invitation: ", error);
    }
  };

  const declineInvitation = async (inviteId) => {
    try {
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
      <div h3>Invitations</div>
      {invitations.length > 0 ? (
        invitations.map((invite) => (
          <Card key={invite.id} css={{ mb: '$5' }}>
            <div size={16}>Invitation from {invite.senderName}</div>
            <Spacer y={0.5} />
            <Button auto color="primary" onClick={() => acceptInvitation(invite.id)}>Accept</Button>
            <Spacer x={0.5} inline />
            <Button auto color="error" onClick={() => declineInvitation(invite.id)}>Decline</Button>
          </Card>
        ))
      ) : (
        <div>No invitations found.</div>
      )}
    </div>
  );
}

export default Invitations;
