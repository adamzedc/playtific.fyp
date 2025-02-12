import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Button, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateRoadmap } from "../../services/openAIService";
import { addRoadmap, getRoadmaps } from "../../services/firebaseService";

// 🔹 Define the Roadmap Type
type Roadmap = {
  id?: string; // Firestore document ID
  goal: string;
  timeframe: string;
  milestones: {
    name: string;
    tasks: string[];
  }[];
};

export default function Page() {
  const [goal, setGoal] = useState(""); // ✅ User input for goal
  const [timeframe, setTimeframe] = useState(""); // ✅ User input for timeframe
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedRoadmaps, setSavedRoadmaps] = useState<Roadmap[]>([]);

  // 🔹 Load Roadmaps from Firebase on App Start
  useEffect(() => {
    const fetchRoadmaps = async () => {
      const roadmaps = await getRoadmaps();
      setSavedRoadmaps(roadmaps);
    };
    fetchRoadmaps();
  }, []);
const handleGenerateRoadmap = async () => {
  // Ensure user provided both a goal and timeframe (in months)
  if (!goal.trim() || !timeframe.trim()) {
    alert("Please enter both a goal and timeframe (in months).");
    return;
  }

  setLoading(true);
  try {
    // Generate the monthly roadmap from the AI
    const monthlyRoadmap = await generateRoadmap(goal, timeframe);

    if (monthlyRoadmap) {
      // Store the new roadmap in component state (for immediate UI)
      setRoadmap(monthlyRoadmap);

      // Save the roadmap to Firestore (or any backend)
      await addRoadmap(monthlyRoadmap);

      // Update local list of saved roadmaps for the UI
      setSavedRoadmaps((prev) => [...prev, monthlyRoadmap]);
    }
  } catch (error) {
    console.error("Error fetching roadmap:", error);
  } finally {
    // Always stop the loading spinner
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>AI-Powered Roadmap</Text>
        <Text style={styles.subtitle}>Enter your goal and timeframe to generate a roadmap.</Text>

        {/* 🔹 User Input for Goal */}
        <TextInput
          style={styles.input}
          placeholder="Enter your goal (e.g., Learn React Native)"
          value={goal}
          onChangeText={setGoal}
        />

        {/* 🔹 User Input for Timeframe */}
        <TextInput
          style={styles.input}
          placeholder="Enter timeframe (e.g., 3 months)"
          value={timeframe}
          onChangeText={setTimeframe}
        />

        <Button title="Generate Roadmap" onPress={handleGenerateRoadmap} disabled={loading} />

        {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}

        {/* 🔹 Display the Latest AI Roadmap */}
        {roadmap && (
          <View style={styles.roadmapContainer}>
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
        )}

        {/* 🔹 Display Saved Roadmaps from Firebase */}
        <Text style={styles.savedRoadmapsTitle}>Saved Roadmaps</Text>
        {savedRoadmaps.length === 0 && <Text>No saved roadmaps found.</Text>}
        {savedRoadmaps.map((roadmap, index) => (
          <View key={roadmap.id || index} style={styles.roadmapContainer}>
            <Text style={styles.goal}>{roadmap.goal}</Text>
            <Text style={styles.timeframe}>Timeframe: {roadmap.timeframe}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
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
  },
  loader: {
    marginVertical: 20,
  },
  roadmapContainer: {
    marginTop: 20,
    width: "100%",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f8f8f8",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  goal: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  timeframe: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#007AFF",
  },
  milestone: {
    marginTop: 10,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  task: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  savedRoadmapsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 10,
  },
});
