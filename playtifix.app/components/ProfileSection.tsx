import React from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Progress from "react-native-progress";

export default function ProfileSection({ userData }: { userData: any }) {
  return (
    <View style={styles.profileCard}>
      {userData ? (
        <>
          <Text style={styles.username}>{userData.name}</Text>
          <Text>Level {userData.level}</Text>
          <Progress.Bar
            progress={userData.xp / 1000}
            width={200}
            color="#007AFF"
          />
          <Text>{userData.xp} / 1000 XP</Text>
          <Text>Streak: {userData.dailyStreak} days</Text>
        </>
      ) : (
        <Text style={styles.noUserText}>Please log in to see your profile.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    width: "100%",
    padding: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
  },
  noUserText: {
    fontStyle: "italic",
    color: "#888",
  },
});