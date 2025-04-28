// firebaseService.ts (UPDATED for Daily Tasks)

import { auth, db } from "../config/firebaseConfig";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { addDays, format } from "date-fns"; // For easy date formatting

// --- Types ---
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

// --- Helper Functions ---

// 🔹 Generate 7 Daily Tasks based on Weekly Task
const generateDailyTasks = async (weeklyTaskTitle: string, userId: string) => {
  try {
    const dailyTasksRef = collection(db, `users/${userId}/dailyTasks`);
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const taskDate = format(addDays(today, i), 'yyyy-MM-dd');
      const taskDocRef = doc(dailyTasksRef);

      await setDoc(taskDocRef, {
        weeklyTaskId: weeklyTaskTitle,
        taskDate,
        taskDescription: `Spend 30 minutes on: ${weeklyTaskTitle}`,
        isCompleted: false,
      });
    }

    console.log("Daily tasks generated successfully.");
  } catch (error) {
    console.error("Error generating daily tasks:", error);
  }
};

// --- Main Functions ---

// 🔹 Add New Roadmap (no changes needed)
export const addRoadmap = async (roadmap: Omit<Roadmap, "id">) => { /* same code as before */ };

// 🔹 Fetch User Roadmaps (no changes needed)
export const getUserRoadmaps = async (): Promise<Roadmap[]> => { /* same code as before */ };

// 🔹 Utility to Check New Week (no changes needed)
export function isNewWeek(timestamp: string): boolean { /* same code as before */ }

// 🔹 Find Next Task (no changes needed)
export function findNextTask(roadmaps: Roadmap[]): any | null { /* same code as before */ }

// 🔹 Set Initial Weekly Task
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

// 🔹 Set Weekly Task (UPDATED to Generate Daily Tasks)
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

    // Also generate daily tasks for this weekly task
    await generateDailyTasks(newTask.title, user.uid);

    console.log("Weekly task and daily tasks set successfully.");
  } catch (error) {
    console.error("Error setting weekly task:", error);
  }
};

// 🔹 Complete Weekly Task (no changes needed)
export const completeWeeklyTask = async () => { /* same code as before */ };

// 🔹 Skip Weekly Task (no changes needed)
export const skipWeeklyTask = async () => { /* same code as before */ };

// 🔹 Mark Daily Task as Completed and Reward XP
export const completeDailyTask = async (taskId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user.");

    const taskRef = doc(db, `users/${user.uid}/dailyTasks/${taskId}`);
    const userRef = doc(db, `users/${user.uid}`);

    await updateDoc(taskRef, { isCompleted: true });

    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    if (!userData) throw new Error("User data not found.");

    let newXP = userData.xp || 0;
    let newLevel = userData.level || 1;

    // Award 100 XP for daily task completion
    newXP += 100;

    // Handle Level Up
    while (newXP >= 1000) {
      newXP -= 1000;
      newLevel += 1;
    }

    await updateDoc(userRef, {
      xp: newXP,
      level: newLevel,
    });

    console.log("Daily task completed! XP rewarded.");
    return { xp: newXP, level: newLevel };

  } catch (error) {
    console.error("Error completing daily task:", error);
    return null;
  }
};
