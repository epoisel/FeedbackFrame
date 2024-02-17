import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../firebaseConfig'; // Adjust import paths as necessary
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { Card, Button, Spacer } from '@nextui-org/react';

function Invitations() {
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const q = query(collection(firestore, "collaborationInvites"), where("receiverId", "==", userId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const invites = [];
      querySnapshot.docs.forEach(async (document) => {
        const inviteData = document.data();
        try {
          const senderDocRef = doc(firestore, "users", inviteData.senderId);
          const senderDoc = await getDoc(senderDocRef);
          if (senderDoc.exists()) {
            const senderInfo = senderDoc.data();
            invites.push({ id: document.id, ...inviteData, senderName: senderInfo.name || senderInfo.email });
          } else {
            console.log("Sender does not exist.");
          }
        } catch (error) {
          console.error("Error fetching sender details:", error);
        }
        setInvitations(invites);
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div>Invitations</div>
      {invitations.length > 0 ? (
        invitations.map((invite) => (
          <Card key={invite.id}>
            <div>Invitation from {invite.senderName}</div>
            <Spacer y={0.5} />
            <Button onClick={() => console.log("Accept invitation")}>Accept</Button>
            <Spacer x={0.5} inline />
            <Button onClick={() => console.log("Decline invitation")}>Decline</Button>
          </Card>
        ))
      ) : (
        <div>No invitations found.</div>
      )}
    </div>
  );
}

export default Invitations;
