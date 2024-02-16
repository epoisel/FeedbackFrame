import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext'; // Adjust path as necessary
import { storage, firestore } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { Button, Input } from '@nextui-org/react';

function UploadForm() {
  const [artwork, setArtwork] = useState(null);
  const [preview, setPreview] = useState(null);
  const { currentUser } = useContext(AuthContext); // Assuming AuthContext is set up

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('No authenticated user found.');
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
