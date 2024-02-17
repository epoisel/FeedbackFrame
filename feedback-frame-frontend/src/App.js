import React, { useState, useEffect } from 'react';
import { firestore, auth } from './firebaseConfig'; // Ensure auth is exported from firebaseConfig
import { collection, query, getDocs } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth'; // This needs to be installed
import UploadForm from './components/UploadForm';
import Uploads from './components/Upload';
import SignIn from './components/SignIn'; // Adjust the path as necessary
import SignOut from './components/SignOut'; // Adjust the path as necessary
import PasswordReset from './components/PasswordReset'; // Adjust the path as necessary
import SignUp from './components/SignUp'; // Adjust the path as necessary
import CollaborationComponent from './components/CollaborationComponent';
import { Invitations } from './components/Invitations'; // Adjust the import path as necessary
import {NextUIProvider} from "@nextui-org/react";
import './App.css';

function App() {
  const [user] = useAuthState(auth);
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
        {user ? (
          <>
            <SignOut />
            <UploadForm onSuccess={handleUploadSuccess} />
            <Uploads uploads={uploads} />
            <CollaborationComponent uploadId="your-upload-id" />
            <Invitations />       
          </>
        ) : (
          <>
            <SignIn />
            <SignUp />
            {/* Consider where to place PasswordReset if needed */}
          </>
        )}
      </main>
    </NextUIProvider>
  );
}

export default App;
