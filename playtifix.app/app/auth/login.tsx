import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { loginUser } from "../../services/authService";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    setErrorMessage(""); // Clear previous error messages

    try {
      const user = await loginUser(email.trim(), password);
      if (user) {
        setErrorMessage(""); // Clear error message on successful login
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.error("Login Error:", error);

      if (error.code === "auth/invalid-email") {
        setErrorMessage("Invalid email format.");
      } else if (error.code === "auth/invalid-credential") {
        setErrorMessage("Invalid email or password.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
      
      
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
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
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },
});
