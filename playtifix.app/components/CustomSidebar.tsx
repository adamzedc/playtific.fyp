import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { logoutUser } from "@/services/authService";
import { useNavigation } from "@react-navigation/native";

export default function CustomSidebar(props: any) {
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logoutUser();
    navigation.navigate("Login");
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderColor: "#ddd" }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>AI Gamification App</Text>
      </View>

      {/* Default Drawer Items */}
      <DrawerItemList {...props} />

      {/* Logout Button */}
      <TouchableOpacity 
        style={{ padding: 15, marginTop: 20, backgroundColor: "#ff6b6b", borderRadius: 5, alignItems: "center" }} 
        onPress={handleLogout}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}
