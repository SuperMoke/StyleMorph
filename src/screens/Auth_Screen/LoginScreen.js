import React, { useState } from "react";
import { View, StyleSheet, Alert, TouchableOpacity, Image } from "react-native";
import { TextInput, Button, Text, ActivityIndicator } from "react-native-paper";
import { authService } from "../../utils/pocketbaseService"; // Adjust path if needed
// Import navigation hook if using React Navigation
// import { useNavigation } from '@react-navigation/native';

const LoginScreen = ({ navigation }) => {
  // Or use useNavigation hook
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // Add state for password visibility
  // const navigation = useNavigation(); // If using hook

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    const result = await authService.login(email, password);
    setLoading(false);

    if (result.success) {
      console.log("Login successful:", result.user);
      // Navigate to the main part of your app, e.g., HomeScreen
      // navigation.replace('MainAppTabs'); // Example navigation
      Alert.alert("Success", "Logged in successfully!"); // Placeholder
    } else {
      Alert.alert(
        "Login Failed",
        result.message || "An unknown error occurred."
      );
    }
  };

  const navigateToRegister = () => {
    navigation.navigate("Register"); // Navigate to RegisterScreen
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/Logo.png")} // Replace with your logo path
        style={{
          width: 200,
          height: 200,
          alignSelf: "center",
          marginBottom: 20,
        }}
        resizeMode="contain"
      />
      <Text style={styles.title}>Welcome Back!</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        mode="outlined"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry={!isPasswordVisible} // Toggle based on state
        mode="outlined"
        right={
          <TextInput.Icon
            icon={isPasswordVisible ? "eye-off" : "eye"} // Change icon based on state
            onPress={togglePasswordVisibility}
          />
        }
      />
      {loading ? (
        <ActivityIndicator
          animating={true}
          size="large"
          style={styles.loader}
        />
      ) : (
        <Button mode="contained" onPress={handleLogin} style={styles.button}>
          Login
        </Button>
      )}
      <TouchableOpacity
        onPress={navigateToRegister}
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#333",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
  },
  loader: {
    marginTop: 20,
  },
  linkContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: "#c2185b", // Or your theme's primary color
    fontSize: 16,
  },
});

export default LoginScreen;
