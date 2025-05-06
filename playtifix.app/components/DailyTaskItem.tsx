import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";

interface DailyTask {
  id: string;
  taskDescription: string;
  isCompleted: boolean;
}

interface Props {
  task: DailyTask;
  onComplete: (taskId: string) => void;
}

const DailyTaskItem: React.FC<Props> = ({ task, onComplete }) => {
  return (
    <Animatable.View
      animation={task.isCompleted ? "fadeIn" : undefined}
      duration={500}
      style={[styles.taskCard, task.isCompleted && styles.taskCompleted]}
    >
      <Text style={styles.taskText}>{task.taskDescription}</Text>
      {!task.isCompleted ? (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => onComplete(task.id)}
        >
          <Text style={styles.buttonText}>Complete</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.completedText}>Completed. See you tomorrow!</Text>
      )}
    </Animatable.View>
  );
};

export default DailyTaskItem;

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: "#f0f8ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  taskCompleted: {
    backgroundColor: "#d3ffd3", // Light green for completed tasks
  },
  taskText: {
    flex: 1,
    fontSize: 16,
  },
  completeButton: {
    backgroundColor: "#4CAF50", // Green button
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  completedText: {
    color: "green",
    fontWeight: "bold",
  },
});
