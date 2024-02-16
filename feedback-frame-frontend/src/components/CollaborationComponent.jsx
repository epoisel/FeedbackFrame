import React, { useState } from 'react';
import { Input, Button, CircularProgress } from '@nextui-org/react';
import { firestore, auth } from '../firebaseConfig'; // Ensure these are correctly imported
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

const CollaborationComponent = ({ uploadId }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email) {
      alert("Please enter an email address for the collaborator.");
      return;
    }

    setLoading(true);

    // Query users collection to find user by email
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("email", "==", email));

    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        alert("No user found with that email.");
        setLoading(false);
        return;
      }

      querySnapshot.forEach(async (doc) => {
        // Assuming the first match is the user we want
        const receiverId = doc.id;

        // Create an invite in the collaborationInvites collection
        await addDoc(collection(firestore, "collaborationInvites"), {
          senderId: auth.currentUser.uid,
          receiverId: receiverId,
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
      <Button
        auto
        color="primary"
        onClick={handleInvite}
        disabled={loading}
      >
        {loading ? <CircularProgress aria-label="Loading..." /> : 'Invite Collaborator'}
      </Button>
    </div>
  );
};


export default CollaborationComponent;
