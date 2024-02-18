import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, getDocs, setDoc, arrayUnion } from "firebase/firestore";
import { Card, Button, Spacer } from '@nextui-org/react';

function Invitations() {
  const [invitations, setInvitations] = useState([]);
  const [acceptanceStatus, setAcceptanceStatus] = useState({});
  const [inviteeEmails, setInviteeEmails] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      setInvitations(resolvedInvites.filter(invite => invite !== null));
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
  const handleInvite = async () => {
    setSubmitting(true);
    const emailsArray = userEmails.split(',').map(email => email.trim()); // Split string into array and trim whitespace
    try {
      await addDoc(collection(firestore, "collaborations"), {
        name: collabName,
        collaboratorEmails: emailsArray,
        // Include any other necessary data for the collaboration
      });
      // Optionally: Send emails to the listed addresses with collaboration details
      console.log('Collaboration created and invitations sent.');
    } catch (error) {
      console.error("Error sending invitations: ", error);
    }
    setSubmitting(false);
  };

  return (
    <div>
    <h3>Invitations</h3>
    {invitations.length > 0 ? invitations.map((invite) => (
      <Card key={invite.id}>
        <div>Invitation from {invite.senderName}</div>
        <Spacer y={0.5} />
        <Button onClick={() => acceptInvitation(invite.id, invite.senderId)}>Accept</Button>
        {/* Display acceptance status if any */}
      </Card>
    )) : <div>No invitations found.</div>}
    
    {/* New form for naming a collaboration and adding invitees */}
    <Spacer y={1.5} />
    <Text h4>Create a New Collaboration</Text>
    <Input
      clearable
      bordered
      fullWidth
      color="primary"
      size="lg"
      placeholder="Collaboration Name"
      value={collabName}
      onChange={(e) => setCollabName(e.target.value)}
    />
    <Spacer y={1} />
    <Input
      clearable
      bordered
      fullWidth
      color="primary"
      size="lg"
      placeholder="Invitee Emails (comma-separated)"
      value={inviteeEmails}
      onChange={(e) => setInviteeEmails(e.target.value)}
    />
    <Spacer y={1} />
    <Button disabled={submitting} auto onPress={handleSendInvites}>
      {submitting ? 'Creating...' : 'Create and Invite'}
    </Button>
  </div>
);
}

export default Invitations;
