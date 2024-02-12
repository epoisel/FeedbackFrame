import React, { useState } from 'react';
import axios from 'axios';
import { ref, uploadBytes, getDownloadURL } from "../firebaseConfig/storage";
import { storage, firestore } from '../firebaseConfig'; // Adjust the import path as necessary
import { collection, addDoc } from "../firebaseConfig/firestore";
import { Button, Input, Select, SelectItem  } from '@nextui-org/react';

function UploadForm() {
  const [artwork, setArtwork] = useState(null);
  const [preview, setPreview] = useState(null);
  const [user, setUser] = useState('User 1');

  const userOptions = [
    { value: 'User 1', label: 'User 1' },
    { value: 'User 2', label: 'User 2' },
  ];

  const handleUpload = async (e) => {
    e.preventDefault();
    // Assume `user` is determined by the authenticated user's info
    const artworkRef = ref(storage, `artworks/${artwork.name}`);
    const previewRef = ref(storage, `previews/${preview.name}`);
    
    try {
      // Upload files to Firebase Storage
      await uploadBytes(artworkRef, artwork);
      await uploadBytes(previewRef, preview);
      
      // Get download URLs
      const artworkUrl = await getDownloadURL(artworkRef);
      const previewUrl = await getDownloadURL(previewRef);
      
      // Save metadata in Firestore
      await addDoc(collection(firestore, "uploads"), {
        user,
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
      <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
        <Select 
          label="Select a User" 
          className="max-w-xs" 
          value={user} 
          onChange={(e) => setUser(e.target.value)} 
          clearable
          css={{
            '& .nextui-dropdown-menu-item': {
              backgroundColor: '#fff', // Set your desired background color
              color: '#333', // Set your desired text color
              '&:hover': {
                backgroundColor: '#f0f0f0', // Set a different background color on hover
              },
            },
          }}
        >
        
    {userOptions.map((user) => (
          <SelectItem key={user.value} value={user.value}>
            {user.label}</SelectItem>
         ))}
        </Select>
      </div>
      <Input type="file" underlined onChange={(e) => setArtwork(e.target.files[0])} />
      <Input type="file" underlined onChange={(e) => setPreview(e.target.files[0])} />
      <Button auto type="submit" color="primary">Upload</Button>
    </form>
  );
}

export default UploadForm;
