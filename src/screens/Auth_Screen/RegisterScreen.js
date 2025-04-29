import React, { useState } from "react";
import { View, StyleSheet, Alert, TouchableOpacity, Image } from "react-native";
import { TextInput, Button, Text, ActivityIndicator } from "react-native-paper";
import { authService } from "../../utils/pocketbaseService"; // Adjust path if needed
// import { useNavigation } from '@react-navigation/native';

const RegisterScreen = ({ navigation }) => {
  // Or use useNavigation hook
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // Add state for password visibility
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false); // Add state for confirm password visibility
  // const navigation = useNavigation(); // If using hook

  const handleRegister = async () => {
    if (!email || !fullName || !password || !passwordConfirm) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const result = await authService.register(
        email,
        fullName,
        password,
        passwordConfirm
      );
      console.log("Registration attempt result:", result);

      if (result.success) {
        console.log("Registration successful:", result.user);
        Alert.alert("Success", "Registered and logged in successfully!", [
          { text: "OK", onPress: () => navigation.navigate("Home") },
        ]);
      } else {
        // More specific error handling
        let errorMessage = result.message || "An unknown error occurred.";

        // Check for specific error types from PocketBase
        if (result.data) {
          const errors = [];
          for (const field in result.data) {
            errors.push(`${field}: ${result.data[field].message}`);
          }
          if (errors.length > 0) {
            errorMessage = errors.join("\n");
          }
        }

        Alert.alert("Registration Failed");
      }
    } catch (error) {
      console.error("Error during registration process:", error);
      Alert.alert(
        "Registration Error",
        "An unexpected error occurred during registration."
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };

  const navigateToLogin = () => {
    navigation.navigate("Login"); // Navigate back to LoginScreen
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/Logo.png")} // Replace with your logo path
        style={{
          width: 150,
          height: 150,
          alignSelf: "center",
          marginBottom: 20,
        }}
        resizeMode="contain"
      />
      <Text style={styles.title}>Create Account</Text>
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
        label="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
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
      <TextInput
        label="Confirm Password"
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        style={styles.input}
        secureTextEntry={!isConfirmPasswordVisible} // Toggle based on state
        mode="outlined"
        right={
          <TextInput.Icon
            icon={isConfirmPasswordVisible ? "eye-off" : "eye"} // Change icon based on state
            onPress={toggleConfirmPasswordVisibility}
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
        <Button mode="contained" onPress={handleRegister} style={styles.button}>
          Register
        </Button>
      )}
      <TouchableOpacity onPress={navigateToLogin} style={styles.linkContainer}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
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
    color: "#c2185b",
    fontSize: 16,
  },
});

export default RegisterScreen;
