import React, { useState, useEffect } from 'react';

import UploadForm from './components/UploadForm';
import Uploads from './components/Upload';
import axios from 'axios';
import './App.css'
import {NextUIProvider} from "@nextui-org/react";

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
    <NextUIProvider>
          <main className="dark text-foreground bg-background">
      <UploadForm onSuccess={handleUploadSuccess} />
      <Uploads uploads={uploads} />
    </main>
    </NextUIProvider>
  );
}

export default App;
