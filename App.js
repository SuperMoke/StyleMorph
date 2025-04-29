import "react-native-gesture-handler";

import React, { useState, useEffect, useCallback } from "react"; // Import useCallback
import { StatusBar } from "expo-status-bar";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper"; // Import PaperProvider
import StylemorphTheme from "./src/utils/Theme";

import LoginScreen from "./src/screens/Auth_Screen/LoginScreen";
import RegisterScreen from "./src/screens/Auth_Screen/RegisterScreen";
import StyleScreen from "./src/screens/User_Screen/StyleScreen";

import { initializePocketBase } from "./src/utils/pocketbaseService";
import ErrorBoundary from "./src/components/ErrorBoundary"; // Import ErrorBoundary

const Stack = createStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Style" component={StyleScreen} />
    </Stack.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};
export default function App() {
  const [pb, setPb] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initialize() {
      try {
        // Initialize PocketBase with AsyncStorage
        const client = await initializePocketBase();
        setPb(client);

        // Set up auth change listener
        const unsubscribe = client.authStore.onChange((token, model) => {
          console.log("Auth state changed:", !!model);
          setIsAuthenticated(!!model);
          setIsLoading(false);
        }, true);

        return () => unsubscribe();
      } catch (error) {
        console.error("Initialization error:", error);
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator
          size="large"
          color={StylemorphTheme.colors.primary}
        />
      </View>
    );
  }
  return (
    <ErrorBoundary>
      <PaperProvider theme={StylemorphTheme}>
        <NavigationContainer>
          {isAuthenticated ? <AppStack /> : <AuthStack />}
          <StatusBar style="auto" />
        </NavigationContainer>
      </PaperProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: StylemorphTheme.colors.background, // Optional: Match theme background
  },
});
