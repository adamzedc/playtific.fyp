import { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, FlatList, SafeAreaView } from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { auth, db } from "../../config/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { getUserData } from "../../services/authService";
import { completeWeeklyTask, setInitialWeeklyTask, setWeeklyTask, completeDailyTask, resetDailyStreakIfMissed,} from "../../services/firebaseService";
import { checkAndUnlockAchievements } from "../../services/achievementService";
import DailyTaskItem from "../../components/DailyTaskItem";
import { addDays, format } from "date-fns";
import { devDayOffset } from "../../config/devSettings";
import ProfileSection from "../../components/ProfileSection";
import TasksHeader from "../../components/TasksHeader";
import Achievements from "../../components/Achievements";
import Instructions from "../../components/Instructions";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Authenticate & initialize weekly task
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          let data = await getUserData(currentUser);
          
          if (data) {
            const streakReset = await resetDailyStreakIfMissed(
              currentUser.uid,
              data.lastDailyTaskCompletedAt,
              data.dailyStreak,
              devDayOffset
            );
  
            if (streakReset) {
              data.dailyStreak = 0; // locally reflect change
            }
            
            setUserData(data);
            setAchievements(data.achievements || []); // Fetch achievements
            // Check if the user has a current weekly task
            if (!data.currentWeeklyTask) {
              await setInitialWeeklyTask();
              const refreshed = await getUserData(currentUser);
              if (refreshed) {
                setUserData(refreshed);
                setAchievements(refreshed.achievements || []); // Update achievements
              } else {
                console.error("Error: Refreshed user data is null.");
                setUserData(null);
                setAchievements([]);
              }
            }
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        setUser(null);
        setUserData(null);
        setAchievements([]); // Clear achievements
      }
  
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  // Fetch today's tasks when user or weekly task changes
  useEffect(() => {
    if (user && userData?.currentWeeklyTask) {
      fetchTodaysTasks(user.uid);
    }
  }, [user, userData?.currentWeeklyTask]);
  // Re-check and unlock achievements whenever userData updates
  useEffect(() => {
    if (userData) {
      checkAndUnlockAchievements(user?.uid || "", {
        xp: userData.xp,
        level: userData.level,
        dailyStreak: userData.dailyStreak,
        roadmapComplete: userData.roadmapComplete,
      })
        .then(setAchievements)
        .catch((err) => console.error("Error unlocking achievements:", err));
    }
  }, [userData]);

  // Update achievements state when userData changes
  useEffect(() => {
    if (userData && typeof userData.achievements === "object" && userData.achievements !== null) {
      const unlockedAchievements = Object.keys(userData.achievements).filter(
        (key) => userData.achievements[key]
      );
      setAchievements(unlockedAchievements);
    } else {
      setAchievements([]); // Reset achievements if the data is invalid
    }
  }, [userData]);

  // This effect runs when the userData changes, ensuring we always have the latest achievements
  useEffect(() => {
    const fetchAchievements = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const unlockedAchievements = Object.keys(userData.achievements || {}).filter(
            (key) => userData.achievements[key]
          );
          setAchievements(unlockedAchievements);
        }
      }
    };
  
    fetchAchievements();
  }, [userData]);


  // Load today's daily tasks
  const fetchTodaysTasks = async (userId: string) => {
    setLoading(true);
    try {
      const today = format(addDays(new Date(), devDayOffset), "yyyy-MM-dd");
      const dailyRef = collection(db, `users/${userId}/dailyTasks`);
      const q = query(dailyRef, where("taskDate", "==", today));
      const snap = await getDocs(q);

      const loaded: any[] = [];
      snap.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...docSnap.data() });
      });
      setDailyTasks(loaded);
    } catch (err) {
      console.error("Error fetching today's tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  // Complete a daily task
  const markTaskAsCompleted = async (taskId: string) => {
    try {
      await completeDailyTask(taskId, devDayOffset);

      // Update the dailyTasks state to mark the task as completed
      setDailyTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, isCompleted: true } : t))
      );

      // Fetch the updated user data
      const updatedUserData = await getUserData(auth.currentUser!);
      setUserData(updatedUserData); // Update the userData state
    } catch (err) {
      console.error("Error completing daily task:", err);
    }
  };

  // Advance to next weekly task manually
  const handleNextTask = async (userId: string) => {
    try {
      // mark the old weekly task complete
      await completeWeeklyTask();
  
      // re-fetch the updated user so `currentWeeklyTask` now points to the next one
      const updated = await getUserData(auth.currentUser!);
      if (!updated?.currentWeeklyTask) {
        throw new Error("No next weekly task found in userData");
      }
  
      // generate the next week's daily tasks in Firestore
      //    pass in the full `currentWeeklyTask` object
      await setWeeklyTask(updated.currentWeeklyTask);  
  
      // re-fetch today's tasks to show the new weekly task
      //    this will also update the local state with the new task
      await fetchTodaysTasks(userId);
  
      // update the local userData state with the new weekly task
      const now = addDays(new Date(), devDayOffset);
      const last = updated.lastDailyTaskCompletedAt
        ? new Date(updated.lastDailyTaskCompletedAt)
        : null;
      let newStreak = updated.dailyStreak || 0;
      if (// Check if the last task was completed yesterday
        last &&
        now.getDate() === last.getDate() + 1 &&
        now.getMonth() === last.getMonth() &&
        now.getFullYear() === last.getFullYear()
      ) {
        newStreak++;
      } else {
        newStreak = 1;
      }
      await updateDoc(doc(db, "users", userId), {
        dailyStreak: newStreak,
        lastDailyTaskCompletedAt: now.toISOString(),
      });
      setUserData({
        ...updated,
        dailyStreak: newStreak,
        lastDailyTaskCompletedAt: now.toISOString(),
      });
  
      console.log(` Weekly task complete! New streak: ${newStreak}`);
    } catch (err) {
      console.error("Error advancing to next weekly task:", err);
      Alert.alert("Error", "Could not advance to the next task. Please try again.");
    }
  };
  
  

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <FlatList
        data={dailyTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DailyTaskItem task={item} onComplete={markTaskAsCompleted} />
        )}
        ListHeaderComponent={
          <>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() =>
                navigation.dispatch(DrawerActions.openDrawer() as any)
              }
            >
              <Text style={styles.menuText}>☰</Text>
            </TouchableOpacity>

            <ProfileSection userData={userData} />
            <TasksHeader
              user={user}
              handleNextTask={handleNextTask}
              dailyTasks={dailyTasks}
            />
          </>
        }
        ListFooterComponent={
          <>
            <Achievements
              achievements={achievements}
              showAchievements={showAchievements}
              setShowAchievements={setShowAchievements}
            />
            <Instructions
              showInstructions={showInstructions}
              setShowInstructions={setShowInstructions}
            />
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  menuButton: {
    position: "absolute",
    top: 50,
    left: 20,
    padding: 10,
  },
  menuText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  noTasksText: {
    paddingHorizontal: 20,
    fontStyle: "italic",
    marginTop: 10,
    textAlign: "center",
  },
});
