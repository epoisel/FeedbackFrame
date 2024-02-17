import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, getDocs, setDoc, arrayUnion } from "firebase/firestore";
import { Card, Button, Spacer } from '@nextui-org/react';

function Invitations() {
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
  
    const q = query(collection(firestore, "collaborationInvites"), where("receiverId", "==", userId));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const fetchInvites = querySnapshot.docs.map(async (document) => {
        const inviteData = document.data();
        try {
          const senderDocRef = doc(firestore, "users", inviteData.senderId);
          const senderDoc = await getDoc(senderDocRef);
          if (senderDoc.exists()) {
            const senderInfo = senderDoc.data();
            return { id: document.id, ...inviteData, senderName: senderInfo.name || senderInfo.email };
          } else {
            console.log("Sender does not exist.");
            return null; // Skip invites where sender info can't be fetched
          }
        } catch (error) {
          console.error("Error fetching sender details:", error);
          return null; // Skip on error
        }
      });
  
      const resolvedInvites = await Promise.all(fetchInvites);
      setInvitations(resolvedInvites.filter(invite => invite !== null)); // Update state with non-null invites
    });
  
    return () => unsubscribe();
  }, []);

  const acceptInvitation = async (inviteId, senderId, uploadId) => {
    try {
      // Update the invitation status to 'accepted'
      await updateDoc(doc(firestore, "collaborationInvites", inviteId), { status: 'accepted' });

      // Attempt to find an existing collaboration document
      const collabQuery = query(collection(firestore, "collaborations"), where("uploadId", "==", uploadId));
      const querySnapshot = await getDocs(collabQuery);

      if (querySnapshot.empty) {
        // Create a new collaboration document
        await setDoc(doc(firestore, "collaborations"), {
          ownerId: senderId,
          collaborators: [senderId, auth.currentUser.uid], // Include both the sender and receiver as collaborators
          uploadId: uploadId
        });
      } else {
        // Add the current user to the existing collaborators array
        const collabDocRef = querySnapshot.docs[0].ref;
        await updateDoc(collabDocRef, {
          collaborators: arrayUnion(auth.currentUser.uid)
        });
      }

      console.log("Collaboration initiated successfully");
    } catch (error) {
      console.error("Error initiating collaboration: ", error);
    }
  };

  return (
    <div>
      <h3>Invitations</h3>
      {invitations.length > 0 ? invitations.map((invite) => (
        <Card key={invite.id}>
          <div>Invitation from {invite.senderName}</div>
          <Spacer y={0.5} />
          <Button onClick={() => acceptInvitation(invite.id, invite.senderId, invite.uploadId)}>Accept</Button>
          <Spacer x={0.5} inline />
          <Button onClick={() => console.log("Decline invitation")}>Decline</Button>
        </Card>
      )) : <div>No invitations found.</div>}
    </div>
  );
}

export default Invitations;
