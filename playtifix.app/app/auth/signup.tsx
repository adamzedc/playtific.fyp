import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { registerUser } from "../../services/authService";
import { useRouter } from "expo-router";

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const handleSignup = async () => {
    setPasswordError(""); // Clear previous error messages

    try {
      if (!email || !password || !name) {
        setPasswordError("Please fill in all fields.");
        return;
      }

      if (password.length < 8) {
        setPasswordError("Password must be at least 8 characters long.");
        return;
      }

      if (!/[A-Z]/.test(password)) {
        setPasswordError("Password must include at least one uppercase letter.");
        return;
      }

      if (!/[0-9]/.test(password)) {
        setPasswordError("Password must include at least one number.");
        return;
      }

      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        setPasswordError("Password must include at least one special character.");
        return;
      }

      // If password is valid
      console.log("✅ Password passed all checks");

      const user = await registerUser(email.trim(), password, name.trim());

      if (user) {
        Alert.alert("Success", "Account created!");
        router.replace("/auth/login");
      } else {
        setPasswordError("Signup failed. Try a different email.");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      setPasswordError("Unexpected error occurred. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Password"
          secureTextEntry={!showPassword} // Toggle visibility
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowPassword((prev) => !prev)} // Toggle state
        >
          <Text style={styles.toggleButtonText}>
            {showPassword ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      </View>

      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : null}

      <Text style={styles.passwordReminder}>
        Password must be at least 8 characters long, include an uppercase letter, a number, and a special character.
      </Text>

      <Button title="Sign Up" onPress={handleSignup} />

      <Text>{"\n"}</Text>
      <Button title="Back to Login" onPress={() => router.push("/auth/login")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    width: "80%",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 15,
  },
  passwordContainer: {
    width: "80%",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
  },
  toggleButton: {
    paddingHorizontal: 10,
  },
  toggleButtonText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  passwordReminder: {
    width: "80%",
    color: "#888",
    fontSize: 12,
    marginBottom: 15,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 15,
    textAlign: "center",
  },
});
