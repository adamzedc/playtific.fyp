import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { auth } from "../config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { ActivityIndicator, View } from "react-native";

export default function Layout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log("Checking authentication state...");

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed. Current user:", currentUser ? currentUser.uid : "No user");
      
      if (!currentUser) {
        console.log("No user found. Redirecting to login...");
        router.replace("/auth/login"); // ✅ Redirect to login if no user
      } else {
        console.log("User found:", currentUser.uid);
        setUser(currentUser);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack>
      {/* ✅ Authentication Screens */}
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: false }} />

      {/* ✅ Main App (Tab Navigation) */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
