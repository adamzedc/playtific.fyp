import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { logoutUser } from "../services/authService";
import { useNavigation } from "@react-navigation/native";

export default function CustomSidebar(props: any) {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await logoutUser();
      Alert.alert("Logged Out", "You have been logged out successfully.");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Logout Failed", "An error occurred while logging out.");
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  logoutContainer: {
    marginTop: "auto",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  logoutButton: {
    padding: 15,
    backgroundColor: "#ff4444",
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
