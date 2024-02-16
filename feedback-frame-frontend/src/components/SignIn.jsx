import { useState } from 'react';
import { auth, firestore } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, updateDoc } from "firebase/firestore";

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Update last login date in Firestore
      await updateDoc(doc(firestore, "users", userCredential.user.uid), {
        lastLogin: new Date(),
      });
      console.log('Signed in and last login updated:', userCredential.user);
    } catch (error) {
      console.error('Error signing in:', error.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}

export default SignIn;
