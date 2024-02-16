import { auth } from '../firebaseConfig'; // adjust path as necessary
import { signOut } from 'firebase/auth';

function SignOut() {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('Signed out');
      // Redirect to sign-in page or home page here
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <button onClick={handleSignOut}>Sign Out</button>
  );
}

export default SignOut;
