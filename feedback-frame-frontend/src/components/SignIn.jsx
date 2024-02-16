import { useState } from 'react';
import { auth } from '../firebaseConfig'; // adjust path as necessary
import { signInWithEmailAndPassword } from 'firebase/auth';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Signed in:', userCredential.user);
      // Redirect to dashboard or home page here
    } catch (error) {
      console.error('Error signing in:', error.message);
      // Handle errors here
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
