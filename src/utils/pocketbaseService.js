import PocketBase, { AsyncAuthStore } from "pocketbase";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create AsyncAuthStore for persistent login
const asyncAuthStore = new AsyncAuthStore({
  save: async (serialized) => AsyncStorage.setItem("pb_auth", serialized),
  initial: null, // Will be set in initialization
  clear: async () => AsyncStorage.removeItem("pb_auth"),
});

// Create a singleton PocketBase client instance
let pb = null;

export const initializePocketBase = async () => {
  try {
    // Get initial auth data from AsyncStorage
    const initialAuth = await AsyncStorage.getItem("pb_auth");
    asyncAuthStore.initial = initialAuth;

    // Initialize PocketBase with the async store
    pb = new PocketBase("https://stylemorph.fly.dev", asyncAuthStore);

    console.log("PocketBase initialized with AsyncStorage");
    return pb;
  } catch (error) {
    console.error("Failed to initialize PocketBase:", error);
    // Initialize without previous auth as fallback
    pb = new PocketBase("https://stylemorph.fly.dev");
    return pb;
  }
};

// Export the client instance getter
export const getPocketbaseClient = () => pb;

// Local error handler for PocketBase errors
const handlePocketBaseError = (error) => {
  console.error("PocketBase Error:", error);

  // More detailed logging to help diagnose the issue
  if (error && error.response) {
    console.error("Status:", error.status);
    console.error("Message:", error.message);
    console.error("Response data:", error.data);

    return {
      success: false,
      message: error.message || "Authentication failed",
      data: error.data,
      status: error.status,
    };
  }

  // Network or connection errors won't have a response object
  if (error.name === "TypeError" && error.message.includes("Network")) {
    return {
      success: false,
      message:
        "Cannot connect to the PocketBase server. Please make sure it's running.",
    };
  }

  // Generic error handling
  return {
    success: false,
    message: error?.message || "An unknown error occurred",
    originalError: error.toString(),
  };
};

// Authentication services
export const authService = {
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} name - User name
   * @param {string} password - User password
   * @param {string} passwordConfirm - Password confirmation
   * @returns {Promise<Object>} - Registered user data
   */
  async register(email, name, password, passwordConfirm) {
    try {
      const user = await pb.collection("users").create({
        email,
        name,
        password,
        passwordConfirm, // Add the passwordConfirm parameter
      });

      await pb.collection("users").authWithPassword(email, password);

      return {
        success: true,
        user: pb.authStore.model,
        token: pb.authStore.token,
      };
    } catch (error) {
      return handlePocketBaseError(error);
    }
  },

  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Logged in user data
   */
  async login(email, password) {
    try {
      await pb.collection("users").authWithPassword(email, password);
      return {
        success: true,
        user: pb.authStore.model,
        token: pb.authStore.token,
      };
    } catch (error) {
      return handlePocketBaseError(error);
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return pb.authStore.isValid;
  },

  /**
   * Get current authenticated user
   * @returns {Object|null}
   */
  getCurrentUser() {
    return pb.authStore.model;
  },

  /**
   * Logout current user
   */
  logout() {
    pb.authStore.clear();
  },
};
