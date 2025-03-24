import { auth, db } from "../config/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// 🔹 Define Roadmap Type
type Task = {
  title: string;
  completed: boolean;
};

type Milestone = {
  name: string;
  tasks: Task[];
};

type Roadmap = {
  id?: string;
  name: string;
  goal: string;
  timeframe: string;
  milestones: Milestone[];
};

// 🔹 Add a New Roadmap for the User
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

    // Get existing roadmaps array or initialize a new one
    const userData = userDoc.data();
    const currentRoadmaps = userData?.roadmaps || [];

    // Prepare the new roadmap with task completion set to false
    const updatedRoadmap = {
      ...roadmap,
      milestones: roadmap.milestones.map((milestone) => ({
        ...milestone,
        tasks: milestone.tasks.map((task) => ({
          title: task,
          completed: false,
        })),
      })),
      createdAt: new Date().toISOString(),
    };

    // Update Firestore with the new roadmaps array
    const updatedRoadmaps = [...currentRoadmaps, updatedRoadmap];
    await updateDoc(userRef, { roadmaps: updatedRoadmaps });

    console.log("Roadmap added successfully for user:", user.uid);
    return updatedRoadmap;
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

// 🔹 Toggle Task Completion (Update XP as well)
export const toggleTaskCompletion = async (
  roadmapIndex: number,
  milestoneIndex: number,
  taskIndex: number
) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user.");

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) throw new Error("User document not found.");

    const userData = userDoc.data();
    const roadmaps = userData?.roadmaps || [];

    const roadmap = roadmaps[roadmapIndex];
    const milestone = roadmap.milestones[milestoneIndex];
    const task = milestone.tasks[taskIndex];

    // Toggle task completion
    task.completed = !task.completed;

    // Update XP based on task completion
    let newXP = userData.xp || 0;
    let newLevel = userData.level || 1;

    if (task.completed) {
      newXP += 500;
      if (newXP >= 1000) {
        newXP -= 1000;
        newLevel += 1;
      }
    } else {
      newXP = Math.max(0, newXP - 500);
    }

    // Update Firestore
    await updateDoc(userRef, {
      roadmaps: roadmaps,
      xp: newXP,
      level: newLevel,
    });

    console.log(`Task toggled: ${task.title} - Completed: ${task.completed}`);
    return { xp: newXP, level: newLevel };
  } catch (error) {
    console.error("Error toggling task completion:", error);
    return null;
  }
};
