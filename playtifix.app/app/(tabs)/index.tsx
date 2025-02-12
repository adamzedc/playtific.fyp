import { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator } from "react-native";
import * as Progress from "react-native-progress";
import { auth } from "../../config/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { getUserData, logoutUser } from "../../services/authService";

export default function HomeScreen() {
  //user will hold User object if authenticated, data fetched when logged in
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Checking Firebase authentication...");
    //unsubscribe will be called when component unmounts (disconnect)
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

  const handleLogout = async () => {
    console.log("Attempting to log out...");
    try {
      await logoutUser();
      console.log("User logged out successfully.");
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    console.log("Loading user data...");
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user && userData ? (
        <View style={styles.profileCard}>
          <Text style={styles.username}>{userData.email}</Text>
          <Text>Level {userData.level}</Text>
          <Progress.Bar 
            progress={userData.xp / 1000} 
            width={200} 
            color="#007AFF"
          />
          <Text>{userData.xp} / 1000 XP</Text>
          <Text>Streak: {userData.streak} days</Text>
          <Button title="Logout" onPress={handleLogout} />
        </View>
      ) : (
        <Text>No user data available. Please log in.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  profileCard: { width: "90%", padding: 15, backgroundColor: "#f8f8f8", borderRadius: 10, marginBottom: 20, alignItems: "center" },
  username: { fontSize: 24, fontWeight: "bold" },
});
