import { auth, db } from "../config/firebaseConfig";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch,} from "firebase/firestore";
import { addDays, format } from "date-fns";

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

// --- Daily Task Generator ---
export const generateDailyTasks = async (weeklyTaskTitle: string,userId: string) => {
  try {
    const dailyTasksRef = collection(db, `users/${userId}/dailyTasks`);
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const taskDate = format(addDays(today, i), "yyyy-MM-dd");
      const taskDocRef = doc(dailyTasksRef); // auto-ID

      await setDoc(taskDocRef, {
        weeklyTaskId: weeklyTaskTitle,
        taskDate,
        taskDescription: `Spend 30 minutes on: ${weeklyTaskTitle}`,
        isCompleted: false,
      });
    }

    console.log(" Daily tasks generated in Firestore.");
  } catch (error) {
    console.error(" Failed to generate daily tasks:", error);
  }
};

// --- Roadmap CRUD ---

export const addRoadmap = async (roadmap: Omit<Roadmap, "id">) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user.");

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error("User document does not exist.");

    const userData = userDoc.data();
    const currentRoadmaps = userData?.roadmaps || [];

    const updatedRoadmap = {
      ...roadmap,
      milestones: roadmap.milestones.map((m) => ({
        ...m,
        tasks: m.tasks.map((t) => ({ title: t, completed: false })),
      })),
      createdAt: new Date().toISOString(),
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

// --- Utility to find next incomplete task ---
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

// --- Weekly Task Initialization ---
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

// --- Assign & Generate Next Weekly Task ---
export const setWeeklyTask = async (newTask: any) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user.");

    const userRef = doc(db, "users", user.uid);

    // 1) Update currentWeeklyTask in user document
    await updateDoc(userRef, {
      currentWeeklyTask: {
        ...newTask,
        assignedAt: new Date().toISOString(),
      },
    });

    // 2) Initialize Firestore write batch
    const batch = writeBatch(db);

    // 3) Queue deletions of all existing daily tasks
    const dtRef = collection(db, `users/${user.uid}/dailyTasks`);
    const dtSnap = await getDocs(dtRef);
    dtSnap.docs.forEach((d) => batch.delete(d.ref));

    // 4) Fetch roadmap to resolve the task title
    const userDoc = await getDoc(userRef);
    const rd = userDoc.exists() ? userDoc.data()?.roadmaps || [] : [];
    const { roadmapIndex, milestoneIndex, taskIndex } = newTask;
    const taskTitle =
      rd[roadmapIndex]?.milestones[milestoneIndex]?.tasks[taskIndex]?.title;

    if (!taskTitle) {
      console.warn("⚠️ generateDailyTasks skipped: missing title");
      await batch.commit(); // still commit the deletes
      return;
    }

    // 5) Queue creation of 7 new daily tasks
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const dateStr = format(addDays(today, i), "yyyy-MM-dd");
      const newDoc = doc(dtRef); // auto-generated ID
      batch.set(newDoc, {
        weeklyTaskId: taskTitle,
        taskDate: dateStr,
        taskDescription: `Spend 30 minutes on: ${taskTitle}`,
        isCompleted: false,
      });
    }

    // 6) Commit batch
    await batch.commit();
    console.log("✅ Weekly task set & daily tasks regenerated (batched).");
  } catch (error) {
    console.error("❌ Error setting weekly task:", error);
  }
};

// --- Complete Weekly Task (XP/Level only) ---
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

    // 1) Mark complete
    const { roadmapIndex, milestoneIndex, taskIndex } = cwt;
    rms[roadmapIndex].milestones[milestoneIndex].tasks[taskIndex].completed = true;

    // 2) XP & level
    let xp = ud.xp || 0;
    let lvl = ud.level || 1;
    xp += 1000; // base XP for completing weekly
    while (xp >= 1000) {
      xp -= 1000;
      lvl++;
    }

    // 3) Find next task
    const next = findNextTask(rms);
    const newCwt = next ? { ...next, assignedAt: new Date().toISOString() } : null;

    // 4) Update Firestore
    await updateDoc(userRef, {
      roadmaps: rms,
      xp,
      level: lvl,
      currentWeeklyTask: newCwt,
    });

    console.log(`Weekly task completed! XP: ${xp}, Level: ${lvl}`);
    return { xp, level: lvl };
  } catch (error) {
    console.error("Error completing weekly task:", error);
    return null;
  }
};

// --- Complete Daily Task (XP & Daily Streak only) ---
export const completeDailyTask = async (
  taskId: string,
  devDayOffset: number = 0
) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user.");

    const userRef = doc(db, "users", user.uid);
    const taskRef = doc(db, `users/${user.uid}/dailyTasks/${taskId}`);

    // 1) Mark done
    await updateDoc(taskRef, { isCompleted: true });

    // 2) Fetch user
    const snap = await getDoc(userRef);
    const u = snap.data() || {};

    // 3) XP & level
    let xp = (u.xp || 0) + 100;
    let lvl = u.level || 1;
    while (xp >= 1000) {
      xp -= 1000;
      lvl++;
    }

    // 4) Daily streak
    const now = addDays(new Date(), devDayOffset);
    const last = u.lastDailyTaskCompletedAt
      ? new Date(u.lastDailyTaskCompletedAt)
      : null;
    let ds = u.dailyStreak || 0;
    if (last) {
      const delta = Math.floor(
        (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
      );
      ds = delta === 1 ? ds + 1 : 1;
    } else {
      ds = 1;
    }

    // 5) Update Firestore
    await updateDoc(userRef, {
      xp,
      level: lvl,
      dailyStreak: ds,
      lastDailyTaskCompletedAt: now.toISOString(),
    });

    console.log("Daily task completed! XP rewarded, streak:", ds);
    return { xp, level: lvl, dailyStreak: ds };
  } catch (error) {
    console.error("Error completing daily task:", error);
    return null;
  }
};
