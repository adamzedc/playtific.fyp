import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { toggleTaskCompletion } from "../services/firebaseService";

type Task = {
  title: string;
  completed: boolean;
};

type Milestone = {
  name: string;
  tasks: (Task | string)[];
};

type Roadmap = {
  goal: string;
  timeframe: string;
  milestones: Milestone[];
};

export default function Checklist({ roadmap, roadmapIndex }: { roadmap: Roadmap, roadmapIndex: number }) {
  const [updatedRoadmap, setUpdatedRoadmap] = useState(roadmap);

  const handleToggleTask = async (milestoneIndex: number, taskIndex: number) => {
    try {
      await toggleTaskCompletion(roadmapIndex, milestoneIndex, taskIndex);
      const updatedTasks = [...updatedRoadmap.milestones];
      const task = updatedTasks[milestoneIndex].tasks[taskIndex];

      // Handle both string and object tasks
      if (typeof task === "string") {
        updatedTasks[milestoneIndex].tasks[taskIndex] = { title: task, completed: true };
      } else {
        task.completed = !task.completed;
      }

      setUpdatedRoadmap({ ...updatedRoadmap, milestones: updatedTasks });
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.goal}>{roadmap.goal}</Text>
      {updatedRoadmap.milestones.map((milestone, milestoneIndex) => (
        <View key={milestoneIndex} style={styles.milestoneContainer}>
          <Text style={styles.milestoneTitle}>{milestone.name}</Text>
          {milestone.tasks.map((task, taskIndex) => {
            const taskTitle = typeof task === "string" ? task : task.title;
            const isCompleted = typeof task !== "string" && task.completed;

            return (
              <TouchableOpacity
                key={taskIndex}
                activeOpacity={0.7}
                style={[styles.taskContainer, isCompleted && styles.completedTask]}
                onPress={() => handleToggleTask(milestoneIndex, taskIndex)}
              >
                <Text style={[styles.taskText, isCompleted && styles.completedText]}>
                  {taskTitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  goal: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  milestoneContainer: { marginVertical: 10 },
  milestoneTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 5 },
  taskContainer: {
    padding: 10,
    marginBottom: 5,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  completedTask: {
    backgroundColor: "#d3d3d3",
  },
  taskText: {
    fontSize: 16,
    color: "#000",
    marginVertical: 5,
    padding: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
  },
  completedText: { textDecorationLine: "line-through", color: "#888" },
});
