import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function TasksHeader({
  user,
  handleNextTask,
  dailyTasks,
}: {
  user: any;
  handleNextTask: (userId: string) => void;
  dailyTasks: any[];
}) {
  return (
    <View style={styles.container} >
      <View style={styles.tasksHeader}>
        <Text style={styles.tasksTitle}>Today's Tasks</Text>
        <View style={styles.nextButtonContainer}>
          <Button
            title="Complete current task"
            onPress={() => user && handleNextTask(user.uid)}
            color="#ADD8E6"
          />
        </View>
      </View>

      {dailyTasks.length === 0 && (
        <Text style={styles.noTasksText}>No tasks for today! 🎉</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20, 
    marginTop: 20,
  },
  tasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  tasksTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  nextButtonContainer: {
    padding:5,
    width: 200,
  },
  noTasksText: {
    fontStyle: "italic",
    color: "#888",
    marginTop: 10,
    textAlign: "center",
  },
});