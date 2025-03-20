import { Drawer } from "expo-router/drawer";
import React from "react";
import { Platform } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

// 👇 Import your custom sidebar
import CustomSidebar from "@/components/CustomSidebar"; // Adjust the path as needed

export default function SidebarLayout() {
  const colorScheme = useColorScheme();

  return (
    <Drawer
      // 👇 Use custom sidebar
      drawerContent={(props) => <CustomSidebar {...props} />}

      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: Colors[colorScheme ?? "dark"].tint,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Home",
          drawerIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      <Drawer.Screen
        name="roadmap"
        options={{
          title: "Roadmap",
          drawerIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />

      <Drawer.Screen
        name="profile"
        options={{
          title: "Profile",
          drawerIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Drawer>
  );
}
