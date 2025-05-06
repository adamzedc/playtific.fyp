import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text,Alert } from "react-native";
import RoadmapForm from "../../components/RoadmapForm";
import RoadmapCard from "../../components/RoadmapCard";
import SavedRoadmaps from "../../components/SavedRoadmaps";
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
      // Check if roadmaps is an array
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
        // Update the local state with the new roadmap
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
        <Text style={styles.title}>ai-powered roadmap</Text>
        <Text style={styles.subtitle}>enter your goal and timeframe to generate a roadmap.</Text>

        <RoadmapForm
          goal={goal}
          setGoal={setGoal}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          handleGenerateRoadmap={handleGenerateRoadmap}
          loading={loading}
        />

        {roadmap && <RoadmapCard roadmap={roadmap} />}

        <SavedRoadmaps
          savedRoadmaps={savedRoadmaps}
          fetchingRoadmaps={fetchingRoadmaps}
          expandedIndexes={expandedIndexes}
          toggleExpand={toggleExpand}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff",
  },
  scrollView: {
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
});