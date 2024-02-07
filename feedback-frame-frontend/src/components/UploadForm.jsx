import React, { useState } from 'react';
import axios from 'axios';

function UploadForm() {
  const [artwork, setArtwork] = useState(null);
  const [preview, setPreview] = useState(null);
  const [user, setUser] = useState('User 1');

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('artwork', artwork);
    formData.append('preview', preview);
    formData.append('user', user);

    try {
      await axios.post('http://localhost:3000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <div>
        <label>User Type:</label>
        <select value={user} onChange={(e) => setUser(e.target.value)}>
          <option value="User 1">User 1</option>
          <option value="User 2">User 2</option>
        </select>
      </div>
      <div>
        <label>Artwork:</label>
        <input type="file" onChange={(e) => setArtwork(e.target.files[0])} />
      </div>
      <div>
        <label>Preview:</label>
        <input type="file" onChange={(e) => setPreview(e.target.files[0])} />
      </div>
      <button type="submit">Upload</button>
    </form>
  );
}

export default UploadForm;
