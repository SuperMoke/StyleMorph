import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { StatusBar } from "expo-status-bar";
import { authService } from "../utils/pocketbaseService";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation

const Header = () => {
  const theme = useTheme();
  const user = authService.getCurrentUser();
  const navigation = useNavigation(); // Get navigation object

  const handleLogout = () => {
    authService.logout();
    // Navigation is handled by the auth state listener in App.js
  };

  // Optional: Add a function to navigate back or to home if needed
  // const handleLogoPress = () => {
  //   navigation.navigate('Home'); // Or use navigation.goBack();
  // };

  return (
    <View style={styles.header}>
      <StatusBar style="dark" />
      {/* Consider making the logo pressable to navigate home */}
      {/* <TouchableOpacity onPress={handleLogoPress}> */}
      <Image
        source={require("../../assets/Logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      {/* </TouchableOpacity> */}
      <View style={styles.userContainer}>
        <Text style={styles.welcomeText}>Welcome, {user?.name || "Guest"}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="logout" size={20} color={theme.colors.primary} />
          <Text style={[styles.logoutText, { color: theme.colors.primary }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16, // Adjust as needed, consider SafeAreaView
    paddingBottom: 16,
    backgroundColor: "#fff",
    elevation: 2, // Or use shadow for iOS
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  logo: {
    width: 80,
    height: 40,
  },
  userContainer: {
    alignItems: "flex-end",
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    fontSize: 12,
    marginLeft: 4,
  },
});

export default Header;
