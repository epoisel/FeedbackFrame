import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, setDoc, arrayUnion } from "firebase/firestore";
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
        // Assume inviteData now includes collaborationName
        try {
          const senderDocRef = doc(firestore, "users", inviteData.senderId);
          const senderDoc = await getDoc(senderDocRef);
          if (senderDoc.exists()) {
            const senderInfo = senderDoc.data();
            return { id: document.id, ...inviteData, senderName: senderInfo.name || senderInfo.email };
          } else {
            return null; // Skip invites where sender info can't be fetched
          }
        } catch (error) {
          return null; // Skip on error
        }
      });
  
      const resolvedInvites = await Promise.all(fetchInvites);
      setInvitations(resolvedInvites.filter(invite => invite !== null));
    });
  
    return () => unsubscribe();
  }, []);

  const acceptInvitation = async (invite) => {
    const userId = auth.currentUser.uid;
    const userDoc = await getDoc(doc(firestore, "users", userId));
    const userName = userDoc.exists() ? userDoc.data().name : "Unknown User";

    try {
      await updateDoc(doc(firestore, "collaborationInvites", invite.id), { status: 'accepted' });
  
      const newCollabDocRef = doc(collection(firestore, "collaborations"));
      await setDoc(newCollabDocRef, {
        collaborationName: invite.collaborationName,
        collaborators: arrayUnion({userId: invite.senderId, name: invite.senderName}, {userId: userId, name: userName}),
        hasStarted: false
      });
  
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
          <div>Invitation from {invite.senderName} for "{invite.collaborationName}"</div>
          <Spacer y={0.5} />
          <Button onClick={() => acceptInvitation(invite)}>Accept</Button>
          <Spacer x={0.5} inline />
          <Button onClick={() => console.log("Decline invitation")}>Decline</Button>
        </Card>
      )) : <div>No invitations found.</div>}
    </div>
  );
}

export default Invitations;
