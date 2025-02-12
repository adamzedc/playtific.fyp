import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { loginUser } from "../../services/authService";
import { useRouter } from "expo-router"; 

export default function LoginScreen() {
  const router = useRouter(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const user = await loginUser(email, password);
    if (user) {
      Alert.alert("Login Successful", "Welcome back!");
      router.replace("/(tabs)");
    } else {
      Alert.alert("Login Failed", "Check your email and password.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={setPassword} />
      <Button title="Login" onPress={handleLogin} />
      <Text>{"\n"}</Text> 
      <Button title="Sign Up" onPress={() => router.push("/auth/signup")} /> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { width: "80%", padding: 10, borderBottomWidth: 1, marginBottom: 10 },
});
