import React, { useState } from 'react';
import { Input, Button, CircularProgress } from '@nextui-org/react';
import { firestore, auth } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs, doc, getDoc } from "firebase/firestore";

const CollaborationComponent = ({ uploadId }) => {
  const [email, setEmail] = useState('');
  const [collabName, setCollabName] = useState(''); // State for collaboration name
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email || !collabName) { // Check for collabName input as well
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

      const senderDoc = await getDoc(doc(firestore, "users", auth.currentUser.uid)); // Fetch the sender's user document
      const senderName = senderDoc.exists() ? senderDoc.data().name : "Unknown"; // Fallback to "Unknown" if not found

      querySnapshot.forEach(async (doc) => {
        const receiverId = doc.id;

        await addDoc(collection(firestore, "collaborationInvites"), {
          senderId: auth.currentUser.uid,
          senderName: senderName, // Include the sender's name
          receiverId: receiverId,
          collaborationName: collabName, // Include the collaboration name
          uploadId: uploadId,
          status: 'pending'
        });
           
        alert("Collaborator invited successfully.");
        setLoading(false);
      });
    } catch (error) {
      console.error("Error inviting collaborator:", error);
      alert("Failed to invite collaborator.");
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
