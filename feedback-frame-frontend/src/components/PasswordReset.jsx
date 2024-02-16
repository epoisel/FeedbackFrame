import { useState } from 'react';
import { auth } from '../firebaseConfig'; // adjust path as necessary
import { sendPasswordResetEmail } from 'firebase/auth';

function PasswordReset() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent');
      // Optionally, redirect to the sign-in page
    } catch (error) {
      console.error('Error sending password reset email:', error);
      // Handle errors here
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}

export default PasswordReset;
