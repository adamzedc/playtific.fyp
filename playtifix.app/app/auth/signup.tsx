import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { registerUser } from "../../services/authService";
import { useRouter } from "expo-router"; 

export default function SignupScreen() {
  const router = useRouter(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSignup = async () => {
    const user = await registerUser(email, password, name);
    if (user) {
      Alert.alert("Account Created", "You can now log in.");
      router.replace("/auth/login"); 
    } else {
      Alert.alert("Signup Failed", "Try a different email.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text> 
      
      <TextInput 
        style={styles.input} 
        placeholder="Username" 
        onChangeText={setName}  
      />

      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        onChangeText={setEmail} 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        secureTextEntry 
        onChangeText={setPassword} 
      />
      
      <Button title="Sign Up" onPress={handleSignup} />

      <Text>{"\n"}</Text> 
      <Button title="Back to Login" onPress={() => router.push("/auth/login")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { width: "80%", padding: 10, borderBottomWidth: 1, marginBottom: 10 },
});
