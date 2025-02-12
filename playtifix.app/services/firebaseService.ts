import { db } from "../config/firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

// 🔹 Define Roadmap Type
type Roadmap = {
  id?: string;  // Firestore document ID is optional
  goal: string;
  timeframe: string;
  milestones: {
    name: string;
    tasks: string[];
  }[];
};

// 🔹 Save Roadmap to Firestore
export const addRoadmap = async (roadmap: Omit<Roadmap, "id">) => {
  try {
    const docRef = await addDoc(collection(db, "roadmaps"), roadmap);
    console.log("Roadmap saved with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error(" Error saving roadmap:", error);
    return null;
  }
};

// 🔹 Fetch All Roadmaps from Firestore (Fixed Type Error)
export const getRoadmaps = async (): Promise<Roadmap[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "roadmaps"));
    return querySnapshot.docs.map(doc => ({
      id: doc.id, // Explicitly adding Firestore document ID
      ...(doc.data() as Omit<Roadmap, "id">) // TypeScript now recognizes the structure
    }));
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    return [];
  }
};
