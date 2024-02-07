import React, { useState, useEffect } from 'react';
import './App.css';
import UploadForm from './components/UploadForm';
import Uploads from './components/Upload';
import axios from 'axios';

function App() {
  const [uploads, setUploads] = useState([]);

  const fetchUploads = async () => {
    try {
      const response = await axios.get('http://localhost:3000/uploads');
      setUploads(response.data);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleUploadSuccess = () => {
    // Refresh uploads data after successful upload
    fetchUploads();
  };

  return (
    <div className="App">
      <h1>Art Collaboration Platform</h1>
      <UploadForm onSuccess={handleUploadSuccess} />
      <Uploads uploads={uploads} />
    </div>
  );
}

export default App;
