import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const checkAndUnlockAchievements = async (
  userId: string,
  stats: {
    xp?: number;
    level?: number;
    dailyStreak?: number;
    roadmapComplete?: boolean;
  }
) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return [];

  const data = userSnap.data();
  const currentAchievements = data.achievements || {};
  const newAchievements: string[] = [];

  const unlock = (name: string) => {
    if (!currentAchievements[name]) {
      currentAchievements[name] = true;
      newAchievements.push(name);
    }
  };

  // Achievement logic
  if (stats.level && stats.level >= 5) unlock("Level 5");
  if (stats.level && stats.level >= 10) unlock("Level 10");
  if (stats.dailyStreak && stats.dailyStreak >= 3) unlock("3-Day Streak");
  if (stats.dailyStreak && stats.dailyStreak >= 7) unlock("7-Day Streak");
  if (stats.roadmapComplete) unlock("Roadmap Complete");

  if (newAchievements.length > 0) {
    await updateDoc(userRef, { achievements: currentAchievements });
    console.log("🎉 New achievements unlocked:", newAchievements);
  }

  return newAchievements;
};
