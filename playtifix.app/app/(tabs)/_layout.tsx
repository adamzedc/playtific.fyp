import { Drawer } from "expo-router/drawer";
import React from "react";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import CustomSidebar from "@/components/CustomSidebar";  

export default function SidebarLayout() {
  const colorScheme = useColorScheme();

  return (
    <Drawer
      drawerContent={(props) => <CustomSidebar {...props} />} 
      screenOptions={{
        headerShown: true,
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
    </Drawer>
  );
}
