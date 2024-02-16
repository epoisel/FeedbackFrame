import React, { useState } from 'react';
import { firestore } from './firebaseConfig'; // Adjust import path as necessary
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

const CollaborationComponent = ({ currentUser }) => {
  const [email, setEmail] = useState('');

  const handleInvite = async () => {
    if (!email) {
      alert("Please enter an email address for the collaborator.");
      return;
    }

    // Example: Create or update a collaboration session
    // This simplistic example assumes a single collaboration document per user
    const collabRef = doc(collection(firestore, "collaborations"), currentUser.uid);
    try {
      await updateDoc(collabRef, {
        ownerId: currentUser.uid,
        collaborators: firestore.FieldValue.arrayUnion(email)
      });
      alert("Collaborator invited successfully.");
    } catch (error) {
      console.error("Error inviting collaborator:", error);
      alert("Failed to invite collaborator.");
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Collaborator's email"
      />
      <button onClick={handleInvite}>Invite Collaborator</button>
    </div>
  );
};

export default CollaborationComponent;
