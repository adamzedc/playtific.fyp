import { auth, db } from "../config/firebaseConfig";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,} from "firebase/firestore";
import { addDays, format } from "date-fns";
import { devDayOffset } from "../config/devSettings";
import { checkAndUnlockAchievements } from "./achievementService";

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
// --- Daily Streak Reset ---
export const resetDailyStreakIfMissed = async (
  userId: string,
  lastCompletedDate: string | null,
  currentStreak: number,
  devDayOffset = 0
) => {
  if (!lastCompletedDate || currentStreak === 0) return false;

  const now = addDays(new Date(), devDayOffset);
  const last = new Date(lastCompletedDate);
  const delta = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (delta > 1) {
    console.log("Missed a day! Resetting daily streak.");
    await updateDoc(doc(db, "users", userId), { dailyStreak: 0 });
    return true;
  }
  return false;
};

// --- Daily Task Generation ---
export const generateDailyTasks = async ( weeklyTaskTitle: string, userId: string) => {
  try {
    const dailyTasksRef = collection(db, `users/${userId}/dailyTasks`);
    const baseDate = addDays(new Date(), devDayOffset); // Use offset for testing

    for (let i = 0; i < 7; i++) {
      const taskDate = format(addDays(baseDate, i), "yyyy-MM-dd");
      const taskDocRef = doc(dailyTasksRef); // auto-ID

      await setDoc(taskDocRef, {
        weeklyTaskId: weeklyTaskTitle,
        taskDate,
        taskDescription: `Spend 30 minutes on: ${weeklyTaskTitle}`,
        isCompleted: false,
      });
    }

    console.log("Daily tasks generated in Firestore with offset:", devDayOffset);
  } catch (error) {
    console.error(" Failed to generate daily tasks:", error);
  }
};

// --- Weekly Task Setup ---
export const setWeeklyTask = async ( newTask: any) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user.");

    const userRef = doc(db, "users", user.uid);
    const assignedAt = addDays(new Date(), devDayOffset).toISOString(); 
    // 1. Update weekly task pointer
    await updateDoc(userRef, {
      currentWeeklyTask: {
        ...newTask,
        assignedAt,
      },
    });

    // 2. Clear existing daily tasks
    const dtRef = collection(db, `users/${user.uid}/dailyTasks`);
    const dtSnap = await getDocs(dtRef);
    for (const d of dtSnap.docs) {
      await deleteDoc(d.ref);
    }

    // 3. Get the task title
    const userDoc = await getDoc(userRef);
    const roadmaps = userDoc.exists() ? userDoc.data()?.roadmaps || [] : [];
    const { roadmapIndex, milestoneIndex, taskIndex } = newTask;
    const taskTitle =
      roadmaps[roadmapIndex]?.milestones[milestoneIndex]?.tasks[taskIndex]?.title;

    if (!taskTitle) {
      console.warn("Task title missing. Daily task generation skipped.");
      return;
    }

    // 4. Generate 7 daily tasks from offset
    await generateDailyTasks(taskTitle, user.uid);

    console.log(" Weekly task set and daily tasks generated (with offset).");
  } catch (error) {
    console.error(" Error setting weekly task:", error);
  }
};


// --- Roadmap Utilities ---


export const addRoadmap = async (roadmap: Omit<Roadmap, "id">) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user.");

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error("User document does not exist.");

    const userData = userDoc.data();
    const currentRoadmaps = userData?.roadmaps || [];

    // Use addDays to calculate the offset date
    const createdAt = addDays(new Date(), devDayOffset).toISOString();

    const updatedRoadmap = {
      ...roadmap,
      milestones: roadmap.milestones.map((m) => ({
        ...m,
        tasks: m.tasks.map((t) => ({ title: t, completed: false })),
      })),
      createdAt, // Use the offset date here
    };

    await updateDoc(userRef, {
      roadmaps: [...currentRoadmaps, updatedRoadmap],
    });

    console.log("Roadmap added successfully for user:", user.uid);
    return updatedRoadmap;
  } catch (error) {
    console.error("Error saving roadmap:", error);
    return null;
  }
};


export const getUserRoadmaps = async (): Promise<Roadmap[]> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user.");

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error("User document does not exist.");

    const userData = userDoc.data();
    return userData?.roadmaps || [];
  } catch (error) {
    console.error("Error fetching user roadmaps:", error);
    return [];
  }
};
export function findNextTask(roadmaps: Roadmap[]): any | null {
  for (let ri = 0; ri < roadmaps.length; ri++) {
    const ms = roadmaps[ri].milestones;
    for (let mi = 0; mi < ms.length; mi++) {
      const tasks = ms[mi].tasks;
      for (let ti = 0; ti < tasks.length; ti++) {
        if (!tasks[ti].completed) {
          return {
            roadmapIndex: ri,
            milestoneIndex: mi,
            taskIndex: ti,
            title: tasks[ti].title,
          };
        }
      }
    }
  }
  return null;
}

// --- Weekly Task Setup ---
export const setInitialWeeklyTask = async (devDayOffset: number = 0) => {
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
        await setWeeklyTask(nextTask); // Pass offset here
        console.log("Initial weekly task set:", nextTask);
      }
    }
  } catch (error) {
    console.error("Error setting initial weekly task:", error);
  }
};



// --- Complete Weekly Task ---
export const completeWeeklyTask = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user.");

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error("User document not found.");

    const ud = userDoc.data();
    const rms = ud?.roadmaps || [];
    const cwt = ud?.currentWeeklyTask;
    if (!cwt) throw new Error("No current weekly task found.");

    const { roadmapIndex, milestoneIndex, taskIndex } = cwt;
    console.log(
      `Marking task as completed: Roadmap ${roadmapIndex}, Milestone ${milestoneIndex}, Task ${taskIndex}`
    );
    rms[roadmapIndex].milestones[milestoneIndex].tasks[taskIndex].completed = true;

    let xp = ud.xp || 0;
    let lvl = ud.level || 1;
    xp += 1000;
    while (xp >= 1000) {
      xp -= 1000;
      lvl++;
    }

    const next = findNextTask(rms);
    console.log("Next task found:", next);

    const newCwt = next ? { ...next, assignedAt: new Date().toISOString() } : null;

    await updateDoc(userRef, {
      roadmaps: rms,
      xp,
      level: lvl,
      currentWeeklyTask: newCwt,
    });

    console.log("Roadmap complete:", !next);
    await checkAndUnlockAchievements(user.uid, {
      xp,
      level: lvl,
      roadmapComplete: !next,
    });

    console.log(`Weekly task completed! XP: ${xp}, Level: ${lvl}`);
    return { xp, level: lvl };
  } catch (error) {
    console.error("Error completing weekly task:", error);
    return null;
  }
};

// --- Complete Daily Task ---
export const completeDailyTask = async (
  taskId: string,
  devDayOffset: number = 0
) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user.");

    const userRef = doc(db, "users", user.uid);
    const taskRef = doc(db, `users/${user.uid}/dailyTasks/${taskId}`);
    await updateDoc(taskRef, { isCompleted: true });

    const snap = await getDoc(userRef);
    const u = snap.data() || {};
    const now = addDays(new Date(), devDayOffset);
    const last = u.lastDailyTaskCompletedAt ? new Date(u.lastDailyTaskCompletedAt) : null;

    let ds = u.dailyStreak || 0;
    if (last) {
      const delta = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      ds = delta === 1 ? ds + 1 : 1;
    } else {
      ds = 1;
    }

    let xp = u.xp || 0;
    let lvl = u.level || 1;
    const multiplier = 1 + ds * 0.05;
    const gainedXP = Math.floor(100 * multiplier);
    xp += gainedXP;

    while (xp >= 1000) {
      xp -= 1000;
      lvl++;
    }

    await updateDoc(userRef, {
      xp,
      level: lvl,
      dailyStreak: ds,
      lastDailyTaskCompletedAt: now.toISOString(),
    });

    await checkAndUnlockAchievements(user.uid, {
      xp,
      level: lvl,
      dailyStreak: ds,
    });

    console.log(
      ` Daily task complete! XP gained: ${gainedXP}, Streak: ${ds}, XP: ${xp}, Level: ${lvl}`
    );
    return { xp, level: lvl, dailyStreak: ds };
  } catch (error) {
    console.error("Error completing daily task:", error);
    return null;
  }
};
