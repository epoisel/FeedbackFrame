import React, { useState } from 'react';
import { Input, Button, CircularProgress } from '@nextui-org/react';
import { firestore, auth } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

const CollaborationComponent = ({ uploadId }) => {
  const [email, setEmail] = useState('');
  const [collabName, setCollabName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email || !collabName) {
      alert("Please enter both an email address and a name for the collaboration.");
      return;
    }

    setLoading(true);

    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("email", "==", email));

    try {
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("No user found with that email.");
        setLoading(false);
        return;
      }

      // Use sender's email directly from auth.currentUser since name is not available
      const senderEmail = auth.currentUser.email; // Assuming the email is available here

      const receiverDoc = querySnapshot.docs[0]; // Assuming a unique email per user
      const receiverId = receiverDoc.id;

      await addDoc(collection(firestore, "collaborationInvites"), {
        senderId: auth.currentUser.uid,
        senderEmail: senderEmail, // Use senderEmail instead of senderName
        receiverId: receiverId,
        collaborationName: collabName,
        uploadId: uploadId,
        status: 'pending'
      });

      alert("Collaborator invited successfully.");
    } catch (error) {
      console.error("Error inviting collaborator:", error);
      alert("Failed to invite collaborator.");
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <div>
      <Input
        clearable
        bordered
        fullWidth
        color="primary"
        size="lg"
        placeholder="Collaborator's email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <Input
        clearable
        bordered
        fullWidth
        color="primary"
        size="lg"
        placeholder="Collaboration Name"
        value={collabName}
        onChange={(e) => setCollabName(e.target.value)}
        disabled={loading}
      />
      <Button
        auto
        color="primary"
        onClick={handleInvite}
        disabled={loading || !email || !collabName}
      >
        {loading ? <CircularProgress aria-label="Loading..." /> : 'Invite Collaborator'}
      </Button>
    </div>
  );
};

export default CollaborationComponent;