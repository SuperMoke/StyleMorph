import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  Alert,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Text, Card, Button, useTheme, Divider, FAB } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Header from "../../components/Header";
import { favoritesService } from "../../utils/favoritesService";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";

const FavoritesScreen = ({ navigation }) => {
  const theme = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);

  // Request media library permissions
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Load favorites data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    setRefreshing(true);
    const favoritesData = await favoritesService.getFavorites();
    setFavorites(favoritesData);
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (id) => {
    Alert.alert(
      "Remove from Favorites",
      "Are you sure you want to remove this item from your favorites?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await favoritesService.removeFavorite(id);
            loadFavorites();
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Favorites",
      "Are you sure you want to remove all favorites? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await favoritesService.clearFavorites();
            loadFavorites();
          },
        },
      ]
    );
  };

  const saveImageToGallery = async (imageUrl) => {
    if (!hasPermission) {
      Alert.alert(
        "Permission Required",
        "Please grant permission to save images to your gallery."
      );
      return;
    }

    try {
      // For base64 images
      if (imageUrl.startsWith("data:image")) {
        const base64Data = imageUrl.split(",")[1];
        const fileName = `stylemorph_${Date.now()}.jpg`;
        const fileUri = FileSystem.documentDirectory + fileName;

        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync("StyleMorph", asset, false);

        Alert.alert("Success", "Image saved to gallery!");
      } else {
        // For remote images
        const fileName = `stylemorph_${Date.now()}.jpg`;
        const fileUri = FileSystem.documentDirectory + fileName;

        const downloadResult = await FileSystem.downloadAsync(
          imageUrl,
          fileUri
        );

        if (downloadResult.status === 200) {
          const asset = await MediaLibrary.createAssetAsync(fileUri);
          await MediaLibrary.createAlbumAsync("StyleMorph", asset, false);
          Alert.alert("Success", "Image saved to gallery!");
        } else {
          throw new Error("Failed to download image");
        }
      }
    } catch (error) {
      console.error("Error saving image:", error);
      Alert.alert("Error", "Failed to save image to gallery.");
    }
  };

  const shareImage = async (imageUrl) => {
    try {
      // For base64 images
      if (imageUrl.startsWith("data:image")) {
        const base64Data = imageUrl.split(",")[1];
        const fileName = `stylemorph_${Date.now()}.jpg`;
        const fileUri = FileSystem.documentDirectory + fileName;

        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert(
            "Sharing not available",
            "Sharing is not available on this device"
          );
        }
      } else {
        // For remote images
        const fileName = `stylemorph_${Date.now()}.jpg`;
        const fileUri = FileSystem.documentDirectory + fileName;

        const downloadResult = await FileSystem.downloadAsync(
          imageUrl,
          fileUri
        );

        if (downloadResult.status === 200) {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
          } else {
            Alert.alert(
              "Sharing not available",
              "Sharing is not available on this device"
            );
          }
        } else {
          throw new Error("Failed to download image");
        }
      }
    } catch (error) {
      console.error("Error sharing image:", error);
      Alert.alert("Error", "Failed to share image.");
    }
  };

  const renderFavoriteItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Title
        title={item.itemType || "Fashion Item"}
        titleStyle={styles.cardTitle}
        subtitle={`Saved: ${new Date(item.savedAt).toLocaleDateString()}`}
        left={(props) => (
          <Icon
            {...props}
            name="hanger"
            size={24}
            color={theme.colors.secondary}
          />
        )}
      />
      <Card.Content>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.favoriteImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.itemDescription}>
          {item.itemDescription || "No description available"}
        </Text>

        {item.stylingRationale && (
          <Text style={styles.rationale}>
            <Text style={styles.boldText}>Why it works:</Text>{" "}
            {item.stylingRationale}
          </Text>
        )}

        {item.potentialColors && (
          <Text style={styles.detailText}>
            <Text style={styles.boldText}>Colors:</Text> {item.potentialColors}
          </Text>
        )}

        {item.materialAndPattern && (
          <Text style={styles.detailText}>
            <Text style={styles.boldText}>Material/Pattern:</Text>{" "}
            {item.materialAndPattern}
          </Text>
        )}

        <View style={styles.actionButtons}>
          <Button
            mode="text"
            icon="content-save"
            onPress={() => saveImageToGallery(item.imageUrl)}
            style={styles.actionButton}
            textColor={theme.colors.primary}
          >
            Save
          </Button>

          <Button
            mode="text"
            icon="share-variant"
            onPress={() => shareImage(item.imageUrl)}
            style={styles.actionButton}
            textColor={theme.colors.primary}
          >
            Share
          </Button>

          <Button
            mode="text"
            icon="heart-off"
            onPress={() => handleRemoveFavorite(item.id)}
            style={styles.actionButton}
            textColor={theme.colors.error}
          >
            Remove
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>My Favorites</Text>
        {favorites.length > 0 && (
          <Button
            mode="text"
            onPress={handleClearAll}
            textColor={theme.colors.error}
          >
            Clear All
          </Button>
        )}
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="heart-off-outline" size={80} color="#cccccc" />
          <Text style={styles.emptyText}>No favorites saved yet</Text>
          <Text style={styles.emptySubText}>
            Your saved fashion items will appear here
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("Style")}
            style={styles.generateButton}
            buttonColor={theme.colors.primary}
          >
            Generate Some Looks
          </Button>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadFavorites} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333333",
    fontFamily: "Georgia",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666666",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999999",
    marginTop: 8,
    marginBottom: 24,
    textAlign: "center",
  },
  generateButton: {
    marginTop: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 20,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },
  cardTitle: {
    color: "#333333",
    fontWeight: "bold",
    fontFamily: "Georgia",
  },
  imageContainer: {
    position: "relative",
  },
  favoriteImage: {
    height: 240,
    width: "100%",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  itemDescription: {
    fontSize: 15,
    fontWeight: "normal",
    marginBottom: 8,
    color: "#343a40",
  },
  rationale: {
    fontSize: 14,
    marginBottom: 8,
    color: "#495057",
    lineHeight: 20,
  },
  detailText: {
    fontSize: 14,
    color: "#495057",
    fontStyle: "normal",
    marginBottom: 4,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});

export default FavoritesScreen;
