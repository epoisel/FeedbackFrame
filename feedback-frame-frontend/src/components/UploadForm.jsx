import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { storage, firestore } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { Button, Input } from '@nextui-org/react';

function UploadForm({ collabId }) { // Accept collabId as a prop
  const [artwork, setArtwork] = useState(null);
  const [preview, setPreview] = useState(null);
  const { currentUser } = useAuth();
  console.log("Received collabId in UploadForm:", collabId);
  const handleUpload = async (e) => {
    e.preventDefault();
    console.log("Current user:", currentUser, "Collab ID:", collabId);
    if (!currentUser || !collabId) {
      alert('No authenticated user found or collaboration ID is missing.');
      return;
    }
    
    const userPath = `users/${currentUser.uid}/`; // Path includes user ID
    const artworkRef = ref(storage, `${userPath}artworks/${artwork.name}`);
    const previewRef = ref(storage, `${userPath}previews/${preview.name}`);
    
    try {
      await uploadBytes(artworkRef, artwork);
      await uploadBytes(previewRef, preview);
      const artworkUrl = await getDownloadURL(artworkRef);
      const previewUrl = await getDownloadURL(previewRef);

      await addDoc(collection(firestore, "uploads"), {
        userId: currentUser.uid,
        artworkUrl,
        previewUrl,
        timestamp: new Date(),
        collabId, // Include collabId in the document
      });

      alert('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    }
  };

  return (
    <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Input type="file" underlined onChange={(e) => setArtwork(e.target.files[0])} />
      <Input type="file" underlined onChange={(e) => setPreview(e.target.files[0])} />
      <Button auto type="submit" color="primary">Upload</Button>
    </form>
  );
}

export default UploadForm;
