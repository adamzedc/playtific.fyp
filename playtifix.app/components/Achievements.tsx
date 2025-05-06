import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function Achievements({
  achievements,
  showAchievements,
  setShowAchievements,
}: {
  achievements: string[];
  showAchievements: boolean;
  setShowAchievements: (value: boolean) => void;
}) {
  return (
    <View style={styles.achievementsSection}>
      <Pressable onPress={() => setShowAchievements(!showAchievements)}>
        <Text style={styles.achievementsTitle}>
          {showAchievements ? "▼ Achievements" : "▶ Achievements"}
        </Text>
      </Pressable>

      {showAchievements && (
        achievements.length > 0 ? (
          achievements.map((achievement, index) => (
            <Text key={index} style={styles.achievementItem}>
              🎖 {achievement}
            </Text>
          ))
        ) : (
          <Text style={styles.noAchievementsText}>
            No achievements unlocked yet.
          </Text>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  achievementsSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f0f8ff",
    borderRadius: 10,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  achievementItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  noAchievementsText: {
    fontStyle: "italic",
    color: "#888",
  },
});