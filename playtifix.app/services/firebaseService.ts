import { auth, db } from "../config/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// 🔹 Define Roadmap Type
type Roadmap = {
  id?: string; // Firestore document ID (optional)
  goal: string;
  timeframe: string;
  milestones: {
    name: string;
    tasks: string[];
  }[];
};

// 🔹 Save Roadmap to Firestore Under the User's Document
export const addRoadmap = async (roadmap: Omit<Roadmap, "id">) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error("No authenticated user found.");
      return null;
    }

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error("User document does not exist.");
      return null;
    }

    // ✅ Get existing roadmaps array or initialize a new one
    const userData = userDoc.data();
    const currentRoadmaps = userData?.roadmaps || [];

    // ✅ Append the new roadmap to the existing array
    const updatedRoadmaps = [...currentRoadmaps, { ...roadmap, createdAt: new Date().toISOString() }];

    // ✅ Update Firestore with the new roadmaps array
    await updateDoc(userRef, { roadmaps: updatedRoadmaps });

    console.log("Roadmap added successfully for user:", user.uid);
    return roadmap;
  } catch (error) {
    console.error("Error saving roadmap:", error);
    return null;
  }
};

// 🔹 Fetch All Roadmaps for the Logged-in User
export const getUserRoadmaps = async (): Promise<Roadmap[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error("No authenticated user found.");
      return [];
    }

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error("User document does not exist.");
      return [];
    }

    const userData = userDoc.data();
    return userData?.roadmaps || [];
  } catch (error) {
    console.error("Error fetching user roadmaps:", error);
    return [];
  }
};
