import React from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";

export default function RoadmapForm({
  goal,
  setGoal,
  timeframe,
  setTimeframe,
  handleGenerateRoadmap,
  loading,
}: {
  goal: string;
  setGoal: (value: string) => void;
  timeframe: string;
  setTimeframe: (value: string) => void;
  handleGenerateRoadmap: () => void;
  loading: boolean;
}) {
  return (
    <View style={styles.formContainer}>
      <TextInput
        style={styles.input}
        placeholder="Enter your goal (e.g., Learn React Native)"
        value={goal}
        onChangeText={setGoal}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter timeframe (e.g., 3 months)"
        value={timeframe}
        keyboardType="numeric"
        onChangeText={setTimeframe}
      />
      <TouchableOpacity
        style={[styles.generateButton, loading && styles.disabledButton]}
        onPress={handleGenerateRoadmap}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Generating..." : "Generate Roadmap"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    width: "90%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  generateButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});