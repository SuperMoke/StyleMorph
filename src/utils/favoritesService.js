import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_STORAGE_KEY = "stylemorph_favorites";

export const favoritesService = {
  // Get all saved favorites
  getFavorites: async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error("Error getting favorites:", error);
      return [];
    }
  },

  // Add an item to favorites
  addFavorite: async (item) => {
    try {
      // Make sure the item has a unique ID
      const favoriteItem = {
        ...item,
        id: item.id || Date.now().toString(),
        savedAt: new Date().toISOString(),
      };

      // Get current favorites
      const currentFavorites = await favoritesService.getFavorites();

      // Check if item already exists
      const exists = currentFavorites.some(
        (fav) =>
          fav.imageUrl === favoriteItem.imageUrl || fav.id === favoriteItem.id
      );

      if (!exists) {
        // Add new item and save
        const updatedFavorites = [...currentFavorites, favoriteItem];
        await AsyncStorage.setItem(
          FAVORITES_STORAGE_KEY,
          JSON.stringify(updatedFavorites)
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding favorite:", error);
      return false;
    }
  },

  // Remove an item from favorites
  removeFavorite: async (id) => {
    try {
      const currentFavorites = await favoritesService.getFavorites();
      const updatedFavorites = currentFavorites.filter(
        (item) => item.id !== id
      );
      await AsyncStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(updatedFavorites)
      );
      return true;
    } catch (error) {
      console.error("Error removing favorite:", error);
      return false;
    }
  },

  // Clear all favorites
  clearFavorites: async () => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([]));
      return true;
    } catch (error) {
      console.error("Error clearing favorites:", error);
      return false;
    }
  },
};
