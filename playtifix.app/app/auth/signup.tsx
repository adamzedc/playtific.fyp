import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { registerUser } from "../../services/authService";
import { useNavigation } from "expo-router";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";


type AuthStackParamList = {
  login: undefined;
  signup: undefined;
};

export default function SignupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, "signup">>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const user = await registerUser(email, password);
    if (user) {
      Alert.alert(" Account Created", "You can now log in.");
      navigation.navigate("login"); //  Redirect to login screen
    } else {
      Alert.alert(" Signup Failed", "Try a different email.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={setPassword} />
      <Button title="Sign Up" onPress={handleSignup} />
      <Button title="Back to Login" onPress={() => navigation.navigate("login")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { width: "80%", padding: 10, borderBottomWidth: 1, marginBottom: 10 },
});
