import React from "react";
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from "react-native";

export default function SavedRoadmaps({
  savedRoadmaps,
  fetchingRoadmaps,
  expandedIndexes,
  toggleExpand,
}: {
  savedRoadmaps: any[];
  fetchingRoadmaps: boolean;
  expandedIndexes: number[];
  toggleExpand: (index: number) => void;
}) {
  if (fetchingRoadmaps) {
    return <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />;
  }

  if (savedRoadmaps.length === 0) {
    return <Text>No saved roadmaps found.</Text>;
  }

  return (
    <View>
      {savedRoadmaps.map((roadmap, index) => (
        <View key={roadmap.id || `roadmap-${index}`} style={styles.roadmapContainer}>
          <Pressable onPress={() => toggleExpand(index)}>
            <Text style={styles.goal}>{roadmap.goal}</Text>
            <Text style={styles.timeframe}>Timeframe: {roadmap.timeframe}</Text>
          </Pressable>
          {expandedIndexes.includes(index) &&
          // Check if milestones exist and are an array
            roadmap.milestones.map((milestone, mIndex) => (
              <View key={mIndex} style={styles.milestone}>
                <Text style={styles.milestoneTitle}>{milestone.name}</Text>
                {Array.isArray(milestone.tasks) &&
                  milestone.tasks.map((task, tIndex) => (
                    <Text key={tIndex} style={styles.task}>• {task.title || "Unnamed Task"}</Text>
                  ))}
              </View>
            ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  roadmapContainer: {
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
  loader: {
    marginVertical: 20,
  },
});