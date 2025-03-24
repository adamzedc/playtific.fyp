import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type WeeklyTaskProps = {
  taskTitle: string;
  onComplete: () => void;
  onSkip: () => void;
};

export default function WeeklyTask({ taskTitle, onComplete, onSkip }: WeeklyTaskProps) {
  return (
    <View style={styles.weeklyTaskCard}>
      <Text style={styles.weeklyTaskTitle}>Weekly Task:</Text>
      {taskTitle && taskTitle.trim().length > 0 ? (
        <>
          <Text style={styles.weeklyTaskText}>{taskTitle}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={onComplete}
            >
              <Text style={styles.buttonText}>COMPLETE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.skipButton]}
              onPress={onSkip}
            >
              <Text style={styles.buttonText}>SKIP</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={styles.noTaskText}>No tasks available for this week</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  weeklyTaskCard: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: "#eeeeee",
    borderRadius: 10,
    alignItems: "center",
  },
  weeklyTaskTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  weeklyTaskText: {
    fontSize: 18,
    marginVertical: 10,
  },
  noTaskText: {
    fontSize: 16,
    color: "#888",
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  actionButton: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  completeButton: {
    backgroundColor: "#4CAF50",
  },
  skipButton: {
    backgroundColor: "#FF5722",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
