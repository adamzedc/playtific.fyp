import React from "react";
import { FlatList, Text, StyleSheet } from "react-native";
import DailyTaskItem from "./DailyTaskItem";

export default function DailyTasksList({
  dailyTasks,
  onComplete,
}: {
  dailyTasks: any[];
  onComplete: (taskId: string) => void;
}) {
  return (
    <FlatList
      data={dailyTasks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <DailyTaskItem task={item} onComplete={onComplete} />
      )}
      ListEmptyComponent={
        <Text style={styles.noTasksText}>No tasks available for today.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  noTasksText: {
    fontStyle: "italic",
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});