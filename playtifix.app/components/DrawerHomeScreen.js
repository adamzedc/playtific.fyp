// DrawerHomeScreen.js

import React from "react";
import { Drawer } from "expo-router/drawer";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import HomeScreen from "./HomeScreen";

export default function DrawerHomeScreen() {
  const colorScheme = useColorScheme();

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: Colors[colorScheme ?? "dark"].tint,
      }}
    >
      <Drawer.Screen
        name="home"
        options={{
          title: "Home",
          drawerIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      >
        {() => <HomeScreen />}
      </Drawer.Screen>
      {/* Add additional Drawer.Screen components for other pages */}
    </Drawer>
  );
}
