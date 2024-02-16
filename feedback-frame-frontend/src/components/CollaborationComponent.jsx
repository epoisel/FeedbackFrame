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
    console.log("Loading set to true");

    // Query users collection to find user by email
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("email", "==", email));
    console.log("Querying for user with email:", email);

    try {
      const querySnapshot = await getDocs(q);
      console.log("Query snapshot:", querySnapshot);

      if (querySnapshot.empty) {
        console.log("No user found with that email.");
        alert("No user found with that email.");
        setLoading(false);
        return;
      }

      querySnapshot.forEach(async (doc) => {
        console.log("Document found with ID:", doc.id, "and data:", doc.data());
        const receiverId = doc.id;

        // Create an invite in the collaborationInvites collection
        console.log("Sending invite with:", {
          senderId: auth.currentUser.uid,
          receiverId: receiverId,
          uploadId: uploadId,
          status: 'pending'
        });

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
      console.error("Error inviting collaborator with email " + email + ":", error);
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
        onChange={(e) => {
          setEmail(e.target.value);
          console.log("Email set to:", e.target.value);
        }}
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
