import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig'; // Adjust path as necessary
import { collection, query, getDocs } from "../firebaseConfig/firestore";
import UploadForm from './components/UploadForm';
import Uploads from './components/Upload';
import axios from 'axios';
import './App.css'
import {NextUIProvider} from "@nextui-org/react";

function App() {
  const [uploads, setUploads] = useState([]);

  const fetchUploads = async () => {
    // Initialize a query against the "uploads" collection
    const q = query(collection(firestore, "uploads"));
    try {
      const querySnapshot = await getDocs(q);
      const uploadsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUploads(uploadsData);
    } catch (error) {
      console.error('Error fetching uploads from Firestore:', error);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleUploadSuccess = () => {
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
