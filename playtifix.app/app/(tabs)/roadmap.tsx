import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateRoadmap } from "../../services/openAIService";
import { addRoadmap, getUserRoadmaps, setWeeklyTask } from "../../services/firebaseService";
import { auth } from "../../config/firebaseConfig";
import { useNavigation } from "@react-navigation/native";

type Roadmap = {
  id?: string;
  goal: string;
  timeframe: string;
  milestones: {
    name: string;
    tasks: string[];
  }[];
};

export default function RoadmapScreen() {
  const [goal, setGoal] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedRoadmaps, setSavedRoadmaps] = useState<Roadmap[]>([]);
  const [fetchingRoadmaps, setFetchingRoadmaps] = useState(true);
  const [showSaved, setShowSaved] = useState(false);
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchRoadmaps = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.error("No authenticated user.");
        setFetchingRoadmaps(false);
        return;
      }

      console.log("Fetching roadmaps for user:", user.uid);
      const roadmaps = await getUserRoadmaps();
      setSavedRoadmaps(roadmaps || []);
      console.log("Fetched roadmaps:", roadmaps);
      setFetchingRoadmaps(false);
    };

    fetchRoadmaps();
  }, []);

  const handleGenerateRoadmap = async () => {
    if (!goal.trim() || !timeframe.trim()) {
      Alert.alert("Error", "Please enter both a goal and timeframe (in months).");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to generate a roadmap.");
      return;
    }

    setLoading(true);
    try {
      const monthlyRoadmap = await generateRoadmap(goal, timeframe);

      if (monthlyRoadmap) {
        setRoadmap(monthlyRoadmap);

        await addRoadmap(monthlyRoadmap);

        await setWeeklyTask({
          title: monthlyRoadmap.goal,
          roadmapIndex: savedRoadmaps.length,
          milestoneIndex: 0,
          taskIndex: 0,
        });

        setSavedRoadmaps((prev) => [...prev, monthlyRoadmap]);

        Alert.alert("Success", "Roadmap generated and saved!");
      }
    } catch (error) {
      console.error("Error fetching roadmap:", error);
      Alert.alert("Error", "Failed to generate roadmap. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>AI-Powered Roadmap</Text>
        <Text style={styles.subtitle}>Enter your goal and timeframe to generate a roadmap.</Text>

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

        <Button title="Generate Roadmap" onPress={handleGenerateRoadmap} disabled={loading} />

        {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}

        {roadmap && roadmap.milestones && roadmap.milestones.length > 0 && (
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

        <Pressable onPress={() => setShowSaved(!showSaved)} style={styles.expandButton}>
          <Text style={styles.expandButtonText}>{showSaved ? "Hide" : "Show"} Saved Roadmaps</Text>
        </Pressable>

        {showSaved && (
          <View style={styles.roadmapContainer}>
            {fetchingRoadmaps ? (
              <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            ) : (savedRoadmaps && savedRoadmaps.length === 0 ? (
              <Text>No saved roadmaps found.</Text>
            ) : (
              savedRoadmaps.map((roadmap, index) => (
                <View key={roadmap.id || `roadmap-${index}`} style={styles.roadmapContainer}>
                  <Pressable onPress={() => toggleExpand(index)}>
                    <Text style={styles.goal}>{roadmap.goal}</Text>
                    <Text style={styles.timeframe}>Timeframe: {roadmap.timeframe}</Text>
                  </Pressable>
                  {expandedIndexes.includes(index) && roadmap.milestones.map((milestone, mIndex) => (
                    <View key={mIndex} style={styles.milestone}>
                      <Text style={styles.milestoneTitle}>{milestone.name}</Text>
                      {milestone.tasks.map((task, tIndex) => (
                        <Text key={tIndex} style={styles.task}>• {typeof task === 'string' ? task : task.title}</Text>
                      ))}
                    </View>
                  ))}
                </View>
              ))
            ))}
          </View>
        )}
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
  expandButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
  },
  expandButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});