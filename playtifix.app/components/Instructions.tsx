import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function Instructions({ showInstructions, setShowInstructions }: any) {
  return (
    <View style={styles.instructionsSection}>
      <Pressable onPress={() => setShowInstructions(!showInstructions)}>
        <Text style={styles.instructionsTitle}>
          {showInstructions ? "▼ Instructions" : "▶ Instructions"}
        </Text>
      </Pressable>

      {showInstructions && (
        <View style={styles.instructionsContent}>
          <Text style={styles.instructionsText}>
            Welcome to the app! Here you can track your tasks, unlock achievements, and follow your roadmap to success.
            Here is how to use the app:
          </Text>
          <Text style={styles.instructionsText}>
            (1) Click the navigation menu (beside home) to access different sections. Go to Roadmap and key in the details.
          </Text>
          <Text style={styles.instructionsText}>
            (2) Go back to the home page. The daily task should be generated automatically.
          </Text>
          <Text style={styles.instructionsText}>
            (3) Spend 30 minutes (or however long you want) on the task. Click on the green "Complete" button to mark it as completed.
          </Text>
          <Text style={styles.instructionsText}>
            (4) If you are not finished, the next daily task will be generated the next day.
          </Text>
          <Text style={styles.instructionsText}>
            (5) However, if you are done, click on the "Next Task" button to generate the next task.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  instructionsSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f0f8ff", // Light blue background for consistency with Achievements
    borderRadius: 10,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  instructionsContent: {
    marginTop: 10,
  },
  instructionsText: {
    fontSize: 16,
    marginBottom: 5, // Add spacing between instruction lines
  },
});