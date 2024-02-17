import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../firebaseConfig'; // Adjust import paths as necessary
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, getDocs, setDoc, arrayUnion } from "firebase/firestore";
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

  // Ensure to include async function inside useEffect or as a standalone function like this
  const acceptInvitation = async (inviteId, senderId, uploadId) => {
    try {
      await updateDoc(doc(firestore, "collaborationInvites", inviteId), {
        status: 'accepted'
      });
  
      const collabQuery = query(collection(firestore, "collaborations"), where("uploadId", "==", uploadId));
      const querySnapshot = await getDocs(collabQuery);
      if (querySnapshot.empty) {
        const newCollabDoc = doc(collection(firestore, "collaborations"));
        await setDoc(newCollabDoc, {
          collabId: newCollabDoc.id,
          ownerId: senderId,
          collaborators: [senderId, auth.currentUser.uid],
          uploadId: uploadId
        });
      } else {
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
      <div>Invitations</div>
      {invitations.length > 0 ? (
        invitations.map((invite) => (
          <Card key={invite.id}>
            <div>Invitation from {invite.senderName}</div>
            <Spacer y={0.5} />
            {/* Pass the necessary parameters to acceptInvitation when the button is clicked */}
            <Button onClick={() => acceptInvitation(invite.id, invite.senderId, invite.uploadId)}>Accept</Button>
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
