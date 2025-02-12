import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { loginUser } from "../../services/authService";
import { useNavigation } from "expo-router";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";


type AuthStackParamList = {
  login: undefined;
  signup: undefined;
  "(tabs)": undefined; 
};


export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, "login">>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const user = await loginUser(email, password);
    if (user) {
      Alert.alert(" Login Successful", "Welcome back!");
      navigation.navigate("(tabs)"); //  Redirect to main app after login
    } else {
      Alert.alert(" Login Failed", "Check your email and password.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={setPassword} />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Sign Up" onPress={() => navigation.navigate("signup")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { width: "80%", padding: 10, borderBottomWidth: 1, marginBottom: 10 },
});
