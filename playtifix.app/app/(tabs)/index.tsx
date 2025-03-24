import { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";
import { auth } from "../../config/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { getUserData, logoutUser } from "../../services/authService";
import Checklist from "../../components/Checklist";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Checking Firebase authentication...");
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log("User is authenticated:", currentUser.uid);
        setUser(currentUser);

        try {
          console.log("Fetching user data...");
          const data = await getUserData(currentUser);

          if (data) {
            console.log("User data fetched successfully:", data);
            setUserData(data);
          } else {
            console.log("No user data found in Firestore.");
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.log("No authenticated user.");
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

          {userData.roadmaps?.map((roadmap: any, index: number) => (
            <View key={index} style={styles.roadmapContainer}>
              <Checklist roadmap={roadmap} roadmapIndex={index} />
            </View>
          ))}
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
  roadmapContainer: {
    marginVertical: 10,
  },
});
