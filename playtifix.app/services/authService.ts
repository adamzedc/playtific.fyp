// authService.ts

import { auth, db } from "../config/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, User,} from "firebase/auth";

// Register New User
export const registerUser = async (
  email: string,
  password: string,
  name: string
) => {
  try {
    console.log("Attempting to register user:", email);

    if (!name || name.trim() === "") {
      throw new Error("Username cannot be empty.");
    }

    // 1) Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("User registered successfully:", user.uid);

    // 2) Set display name in Auth profile
    await updateProfile(user, { displayName: name });

    // 3) Store initial user data in Firestore
    //    — note: we remove the old `streak` field and replace it with `dailyStreak`
    await setDoc(doc(db, "users", user.uid), {
      email: user.email || "",
      name: name  || "Unnamed User",
      xp: 0,
      level: 1,
      dailyStreak: 0,
      lastDailyTaskCompletedAt: null,
      roadmaps: [],
      currentWeeklyTask: null,
      achievements: {
        firstDaily: false,
        firstWeekly: false,
        dailyStreak3: false,
        dailyStreak7: false,
        level5: false,
        level10: false,
        roadmapComplete: false,
        backOnTrack: false,
      }
    });

    console.log("User data stored in Firestore.");
    return user;
  } catch (error) {
    console.error("Registration error:", error);
    return null;
  }
};

// Login User
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login error (authService):", error);
    throw error; // Re-throw the error to be handled in the calling function
  }
};

// Logout User
export const logoutUser = async () => {
  try {
    console.log("Attempting to log out user...");
    await signOut(auth);
    console.log("User logged out successfully.");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// Get User Data from Firestore
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
