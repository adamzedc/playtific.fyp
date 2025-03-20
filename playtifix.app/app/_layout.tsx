import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { auth } from "../config/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { ActivityIndicator, View } from "react-native";

export default function Layout() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Checking authentication state...");

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed. Current user:", currentUser ? currentUser.uid : "No user");
      setUser(currentUser);
      setIsLoading(false); // ✅ Ensure loading state updates after auth check
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        console.log("No user found. Redirecting to login...");
        router.replace("/auth/login"); // ✅ Ensure navigation is triggered
      }
    }
  }, [user, isLoading]);

  if (isLoading) {
    console.log("Still loading authentication state...");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
