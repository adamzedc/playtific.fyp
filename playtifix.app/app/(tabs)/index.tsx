import { useEffect, useState } from "react";
import { 
  View, Text, Button, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Alert, FlatList 
} from "react-native";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";
import { auth, firestore } from "../../config/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { getUserData, logoutUser } from "../../services/authService";
import { completeWeeklyTask, skipWeeklyTask, setInitialWeeklyTask } from "../../services/firebaseService";
import Checklist from "../../components/Checklist";
import WeeklyTask from "../../components/WeeklyTask";
import { format } from "date-fns";
import * as Animatable from 'react-native-animatable';


export default function HomeScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);

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
              const refreshedData = await getUserData(currentUser);
              setUserData(refreshedData);
            }
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTodaysTasks(user.uid);
    }
  }, [user]);

  const fetchTodaysTasks = async (userId: string) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const dailyTasksRef = collection(firestore, `users/${userId}/dailyTasks`);
      const q = query(dailyTasksRef, where("taskDate", "==", today));
      const querySnapshot = await getDocs(q);

      const loadedTasks: any[] = [];
      querySnapshot.forEach((docSnap) => {
        loadedTasks.push({ id: docSnap.id, ...docSnap.data() });
      });

      setDailyTasks(loadedTasks);
    } catch (error) {
      console.error("Error fetching today's tasks:", error);
    }
  };

  const markTaskAsCompleted = async (taskId: string) => {
    try {
      const taskDocRef = doc(firestore, `users/${user?.uid}/dailyTasks/${taskId}`);
      await updateDoc(taskDocRef, { isCompleted: true });

      setDailyTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, isCompleted: true } : task
        )
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleCompleteTask = async () => {
    try {
      await completeWeeklyTask();
      Alert.alert("Success", "Task completed successfully!");
      await refreshUserData();
    } catch (error) {
      console.error("Error completing task:", error);
      Alert.alert("Error", "Failed to complete the task.");
    }
  };

  const handleSkipTask = async () => {
    try {
      await skipWeeklyTask();
      Alert.alert("Skipped", "Task skipped successfully!");
      await refreshUserData();
    } catch (error) {
      console.error("Error skipping task:", error);
      Alert.alert("Error", "Failed to skip the task.");
    }
  };

  const refreshUserData = async () => {
    try {
      const data = await getUserData(auth.currentUser);
      setUserData(data);
    } catch (error) {
      console.error("Error refreshing user data:", error);
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
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
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
          <Text>Streak: {userData.streak} days</Text>

          {/* Daily Tasks Section */}
          <View style={{ marginTop: 20, width: '100%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Today's Tasks</Text>
            {dailyTasks.length === 0 ? (
              <Text>No tasks for today! 🎉</Text>
            ) : (
              <FlatList
                data={dailyTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Animatable.View
                    animation={item.isCompleted ? "fadeIn" : undefined}
                    duration={500}
                    style={[styles.taskCard, item.isCompleted && styles.taskCompleted]}
                  >
                    <Text style={styles.taskText}>{item.taskDescription}</Text>
                    {!item.isCompleted && (
                      <TouchableOpacity
                        style={styles.completeButton}
                        onPress={() => markTaskAsCompleted(item.id)}
                      >
                        <Text style={styles.buttonText}>Complete</Text>
                      </TouchableOpacity>
                    )}
                    {item.isCompleted && <Text style={styles.completedText}>Completed</Text>}
                  </Animatable.View>

                )}
              />
            )}
          </View>

          {/* Weekly Task Section */}
          <WeeklyTask
            taskTitle={userData.currentWeeklyTask?.title || ""}
            onComplete={handleCompleteTask}
            onSkip={handleSkipTask}
          />

        </View>
      ) : (
        <View>
          <Text>No user data available. Please log in.</Text>
          <Button title="Login" onPress={() => navigation.navigate("Login")} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#fff" 
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
    alignItems: "center" 
  },
  username: { 
    fontSize: 24, 
    fontWeight: "bold" 
  },
  taskCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskCompleted: {
    backgroundColor: '#d3ffd3',
  },
  taskText: {
    flex: 1,
    fontSize: 16,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  completedText: {
    color: 'green',
    fontWeight: 'bold',
  }
});
