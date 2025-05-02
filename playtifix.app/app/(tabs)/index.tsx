// index.tsx

import { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
} from "react-native";
import * as Progress from "react-native-progress";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { auth, db } from "../../config/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { getUserData } from "../../services/authService";
import {
  completeWeeklyTask,
  setInitialWeeklyTask,
  setWeeklyTask,
  completeDailyTask,
} from "../../services/firebaseService";
import DailyTaskItem from "../../components/DailyTaskItem";
import { addDays, format } from "date-fns";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);

  // Authenticate & initialize weekly task
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const data = await getUserData(currentUser);
          if (data) {
            setUserData(data);
            if (!data.currentWeeklyTask) {
              await setInitialWeeklyTask();
              const refreshed = await getUserData(currentUser);
              setUserData(refreshed);
            }
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        setUser(null);
        setUserData(null);
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

  // Load today's daily tasks
  const fetchTodaysTasks = async (userId: string) => {
    setLoading(true);
    try {
      const today = format(addDays(new Date(), 2), "yyyy-MM-dd");
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
      await completeDailyTask(taskId);
      setDailyTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, isCompleted: true } : t
        )
      );
    } catch (err) {
      console.error("Error completing daily task:", err);
    }
  };

  // Advance to next weekly task manually
  const handleNextTask = async (userId: string) => {
    try {
      await completeWeeklyTask();

      const updated = await getUserData(auth.currentUser!);
      setUserData(updated);

      if (!updated?.currentWeeklyTask) {
        Alert.alert("🎉 All Done!", "You’ve completed all roadmap objectives.");
        setDailyTasks([]);
        return;
      }

      await setWeeklyTask(updated.currentWeeklyTask);
      await fetchTodaysTasks(userId);
    } catch (err) {
      console.error("Error advancing to next weekly task:", err);
      Alert.alert(
        "Error",
        "Could not advance to the next task. Please try again."
      );
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
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() =>
          navigation.dispatch(DrawerActions.openDrawer() as any)
        }
      >
        <Text style={styles.menuText}>☰</Text>
      </TouchableOpacity>

      {user && userData ? (
        <View style={styles.profileCard}>
          <Text style={styles.username}>{userData.name}</Text>
          <Text>Level {userData.level}</Text>
          <Progress.Bar
            progress={userData.xp / 1000}
            width={200}
            color="#007AFF"
          />
          <Text>{userData.xp} / 1000 XP</Text>
          <Text>Streak: {userData.dailyStreak} days</Text>

          {/* Daily Tasks Section */}
          <View style={styles.tasksSection}>
            <Text style={styles.tasksTitle}>Today's Tasks</Text>
            {dailyTasks.length === 0 ? (
              <Text>No tasks for today! 🎉</Text>
            ) : (
              <FlatList
                data={dailyTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <DailyTaskItem
                    task={item}
                    onComplete={markTaskAsCompleted}
                  />
                )}
              />
            )}

            {/* Next Task Button */}
            <View style={styles.nextButtonContainer}>
              <Button
                title="Next Task"
                onPress={() => handleNextTask(user.uid)}
                color="#007AFF"
              />
            </View>
          </View>
        </View>
      ) : (
        <View>
          <Text>No user data available. Please log in.</Text>
          <Button
            title="Login"
            onPress={() => navigation.navigate("Login" as any)}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
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
  profileCard: {
    width: "100%",
    padding: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
  },
  tasksSection: {
    marginTop: 20,
    width: "100%",
  },
  tasksTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  nextButtonContainer: {
    marginTop: 20,
  },
});
