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

// 🔹 Utility Function to Check for New Week
export function isNewWeek(timestamp: string): boolean {
  const lastAssigned = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastAssigned.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 7;
}

// 🔹 Find the Next Task to Assign
export function findNextTask(roadmaps: Roadmap[]): any | null {
  for (let roadmapIndex = 0; roadmapIndex < roadmaps.length; roadmapIndex++) {
    const milestones = roadmaps[roadmapIndex].milestones;
    for (let milestoneIndex = 0; milestoneIndex < milestones.length; milestoneIndex++) {
      const tasks = milestones[milestoneIndex].tasks;
      for (let taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
        if (!tasks[taskIndex].completed) {
          return {
            roadmapIndex,
            milestoneIndex,
            taskIndex,
            title: tasks[taskIndex].title,
          };
        }
      }
    }
  }
  return null;
}

// 🔹 Set the First Weekly Task if None Exists
export const setInitialWeeklyTask = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user.");

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) throw new Error("User document not found.");

    const userData = userDoc.data();
    const roadmaps = userData?.roadmaps || [];
    const currentWeeklyTask = userData?.currentWeeklyTask;

    if (!currentWeeklyTask) {
      const nextTask = findNextTask(roadmaps);
      if (nextTask) {
        await setWeeklyTask(nextTask);
        console.log("Initial weekly task set:", nextTask);
      }
    }
  } catch (error) {
    console.error("Error setting initial weekly task:", error);
  }
};

// 🔹 Complete the Current Weekly Task with Streak Handling
export const completeWeeklyTask = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user.");

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) throw new Error("User document not found.");

    const userData = userDoc.data();
    const roadmaps = userData?.roadmaps || [];
    const currentWeeklyTask = userData?.currentWeeklyTask;

    if (!currentWeeklyTask) throw new Error("No current weekly task found.");

    // Mark the current weekly task as completed
    const { roadmapIndex, milestoneIndex, taskIndex } = currentWeeklyTask;
    roadmaps[roadmapIndex].milestones[milestoneIndex].tasks[taskIndex].completed = true;

    // Calculate XP and Level
    let newXP = userData.xp || 0;
    let newLevel = userData.level || 1;
    let newStreak = userData.streak || 0;
    let lastCompletedAt = userData.lastTaskCompletedAt ? new Date(userData.lastTaskCompletedAt) : null;
    const now = new Date();
    const dayDifference = lastCompletedAt ? Math.floor((now.getTime() - lastCompletedAt.getTime()) / (1000 * 60 * 60 * 24)) : null;

    // Streak Logic
    if (lastCompletedAt && dayDifference === 1) {
      newStreak += 1;  // Increase streak
    } else if (!lastCompletedAt || dayDifference > 1) {
      newStreak = 1;  // Reset streak
    }

    // Calculate XP with Streak Multiplier
    const streakMultiplier = 1 + (newStreak * 0.05);  // 5% per streak day
    const baseXP = 1000;
    const xpGained = Math.floor(baseXP * streakMultiplier);
    newXP += xpGained;

    // Level up if XP exceeds threshold
    while (newXP >= 1000) {
      newXP -= 1000;
      newLevel += 1;
    }

    // Find and set the next task
    const nextTask = findNextTask(roadmaps);
    await updateDoc(userRef, {
      roadmaps: roadmaps,
      xp: newXP,
      level: newLevel,
      streak: newStreak,
      lastTaskCompletedAt: now.toISOString(),
      currentWeeklyTask: nextTask ? { ...nextTask, assignedAt: new Date().toISOString() } : null,
    });

    console.log(`Task completed! XP: ${newXP}, Level: ${newLevel}, Streak: ${newStreak}, XP Gained: ${xpGained}`);
    return { xp: newXP, level: newLevel, streak: newStreak };
  } catch (error) {
    console.error("Error completing weekly task:", error);
    return null;
  }
};


// 🔹 Skip the Current Weekly Task
export const skipWeeklyTask = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user.");

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) throw new Error("User document not found.");

    const userData = userDoc.data();
    const roadmaps = userData?.roadmaps || [];
    const nextTask = findNextTask(roadmaps);

    await updateDoc(userRef, {
      currentWeeklyTask: nextTask ? { ...nextTask, assignedAt: new Date().toISOString() } : null,
    });

    console.log("Weekly task skipped and new task set.");
  } catch (error) {
    console.error("Error skipping weekly task:", error);
  }
};

// 🔹 Set a New Weekly Task in Firestore
export const setWeeklyTask = async (newTask: any) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user.");

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      currentWeeklyTask: {
        ...newTask,
        assignedAt: new Date().toISOString(),
      },
    });
    console.log("Weekly task set successfully.");
  } catch (error) {
    console.error("Error setting weekly task:", error);
  }
};
