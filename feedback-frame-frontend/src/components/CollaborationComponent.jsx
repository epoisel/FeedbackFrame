import React, { useState } from 'react';
import { Input, Button, CircularProgress } from '@nextui-org/react';
import { firestore, auth } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs, doc, getDoc } from "firebase/firestore";

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
  
      try {
        const usersRef = collection(firestore, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
  
        if (querySnapshot.empty) {
          alert("No user found with that email.");
          setLoading(false);
          return;
        }
  
        // Fetch the sender's (current user's) name
        const senderDoc = await getDoc(doc(firestore, "users", auth.currentUser.uid));
        const senderName = senderDoc.exists() ? senderDoc.data().name : "Unknown User";
  
        // Assuming only one user with the email, adjust if your app allows multiple users with the same email
        const receiverDoc = querySnapshot.docs[0];
        const receiverId = receiverDoc.id;
  
        await addDoc(collection(firestore, "collaborationInvites"), {
          senderId: auth.currentUser.uid,
          senderName: senderName,
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
      {/* Collaboration Name Input */}
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
        disabled={loading || !email || !collabName} // Disable button if email or collabName is not provided
      >
        {loading ? <CircularProgress aria-label="Loading..." /> : 'Invite Collaborator'}
      </Button>
    </div>
  );
};

export default CollaborationComponent;
