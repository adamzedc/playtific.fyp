import { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { auth } from "../../config/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { getUserData, logoutUser } from "../../services/authService";

// Define Drawer Navigation Type
type DrawerParamList = {
  Home: undefined;
  Roadmap: undefined;
  Login: undefined;
};

export default function HomeScreen() {
  // Use drawer navigation
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  // User authentication state
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
      {/* Open Drawer Button */}
      <TouchableOpacity 
        style={styles.menuButton} 
        onPress={() => navigation.openDrawer()}
      >
        <Text style={styles.menuText}>☰ </Text>
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
        </View>
      ) : (
        <View>
          <Text>No user data available. Please log in.</Text>
          <Button title="Login" onPress={() => navigation.navigate("Login")} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "flex-start", 
    padding: 50,
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
    width: "90%", 
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
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
