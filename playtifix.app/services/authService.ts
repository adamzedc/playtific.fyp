import { auth, db } from "../config/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from "firebase/auth";

export const registerUser = async (email: string, password: string) => {
  try {
    console.log("Attempting to register user:", email);

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("User registered successfully:", user.uid);

    // ✅ Store user data in Firestore safely
    try {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        xp: 0,
        level: 1,
        streak: 0,
        roadmaps: [],
      });
      console.log("User data stored in Firestore.");
    } catch (error) {
      console.error("Error saving user data to Firestore:", error);
    }

    return user; // ✅ Return user even if Firestore fails
  } catch (error) {
    console.error("Registration error:", error);
    return null;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    console.log("Attempting to log in user:", email);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in successfully:", userCredential.user.uid);

    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
};

export const logoutUser = async () => {
  try {
    console.log("Attempting to log out user...");
    
    await signOut(auth);
    
    console.log("User logged out successfully.");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// 🔹 Get User Data from Firestore
export const getUserData = async (user: User) => {
  try {
    console.log("Fetching user data for:", user.uid);

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("User data retrieved from Firestore:", docSnap.data());
      return docSnap.data();
    } else {
      console.log("No user data found in Firestore.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};
