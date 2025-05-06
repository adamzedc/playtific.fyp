import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function RoadmapCard({
  roadmap,
}: {
  roadmap: {
    goal: string;
    timeframe: string;
    milestones: { name: string; tasks: string[] }[];
  };
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.goal}>{roadmap.goal}</Text>
      <Text style={styles.timeframe}>Timeframe: {roadmap.timeframe}</Text>
      {roadmap.milestones.map((milestone, index) => (
        <View key={index} style={styles.milestone}>
          <Text style={styles.milestoneTitle}>{milestone.name}</Text>
          {milestone.tasks.map((task, i) => (
            <Text key={i} style={styles.task}>• {task}</Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    width: "100%",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  goal: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  timeframe: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 10,
    color: "#007AFF",
  },
  milestone: {
    marginTop: 10,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  task: {
    fontSize: 14,
    color: "#555",
    marginLeft: 10,
  },
});