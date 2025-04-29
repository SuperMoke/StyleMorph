import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Text, Button, Card, useTheme } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { analyzeBodyStyleWithAI } from "../../utils/aiService";
import { generateClothingImage } from "../../utils/imageGenerationService";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";

const StyleScreen = () => {
  const theme = useTheme();
  const [image, setImage] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [generatedImages, setGeneratedImages] = useState({});
  const [hasPermission, setHasPermission] = useState(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus === "granted" && libraryStatus === "granted") {
        setHasPermission(true);
      } else {
        setHasPermission(false);
        Alert.alert(
          "Permissions Required",
          "Camera and media library permissions are required to use this feature.",
          [{ text: "OK" }]
        );
      }
    } else {
      setHasPermission(true);
    }
  };

  const selectImage = async (useCamera = false) => {
    if (!hasPermission && Platform.OS !== "web") {
      Alert.alert(
        "Permission Denied",
        "Please grant camera and media library permissions in your device settings.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      let result;
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 5],
        quality: 0.8,
        base64: true,
      };

      if (useCamera) {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      console.log("Image picker result:", !!result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        console.log("Selected Asset URI:", selectedAsset.uri);
        console.log("Base64 included:", !!selectedAsset.base64);

        if (!selectedAsset.base64) {
          console.warn(
            "Base64 data not directly available in asset. Attempting manual read (might be slow)."
          );

          Alert.alert(
            "Error",
            "Failed to process image data (Base64 missing)."
          );
          return;
        }

        setImage({
          uri: selectedAsset.uri,
          base64: selectedAsset.base64,
          width: selectedAsset.width,
          height: selectedAsset.height,
        });
        setResults(null);
        setGeneratedImages({});
      } else if (result.canceled) {
        console.log("Image selection cancelled by user.");
      } else {
        console.log("Image picker did not return assets.");
      }
    } catch (error) {
      console.error("Image selection error:", error);
      Alert.alert(
        "Error",
        `Failed to select image: ${error.message || "Unknown error"}`,
        [{ text: "OK" }]
      );
    }
  };

  const analyzeImage = async () => {
    if (!image || !image.base64) {
      Alert.alert(
        "No Image",
        "Please select or take a photo with valid data first."
      );
      return;
    }

    try {
      setLoading(true);
      setResults(null);
      setGeneratedImages({});

      const analysisResult = await analyzeBodyStyleWithAI(image.base64);

      setResults(analysisResult);
      setLoading(false);

      if (analysisResult?.styleRecommendations?.length > 0) {
        setGeneratingImages(true);

        for (
          let index = 0;
          index < analysisResult.styleRecommendations.length;
          index++
        ) {
          try {
            const item = analysisResult.styleRecommendations[index];

            const description = `${item.itemDescription}${
              item.potentialColors ? `, ${item.potentialColors}` : ""
            }${item.materialAndPattern ? `, ${item.materialAndPattern}` : ""}`;

            const imageUrl = await generateClothingImage(description);

            setGeneratedImages((prevImages) => ({
              ...prevImages,
              [index]: imageUrl,
            }));
          } catch (error) {
            console.error(`Error generating image for item ${index}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      Alert.alert("Error", "Failed to analyze image. Please try again.");
      setResults(null);
    } finally {
      setLoading(false);
      setGeneratingImages(false);
    }
  };

  const renderStyleRecommendations = () => {
    if (
      !results ||
      !results.styleRecommendations ||
      results.styleRecommendations.length === 0
    ) {
      return (
        <Text style={styles.noResultsText}>
          No specific item recommendations available.
        </Text>
      );
    }

    return results.styleRecommendations.map((item, index) => (
      <View key={index} style={styles.recommendationItemContainer}>
        {generatedImages[index] ? (
          <Image
            source={{ uri: generatedImages[index] }}
            style={styles.recommendationImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <ActivityIndicator size="large" color={theme.colors.secondary} />
            <Text style={styles.placeholderText}>
              {generatingImages
                ? "Creating your personalized fashion item..."
                : "Image generation complete"}
            </Text>
          </View>
        )}

        <Text style={styles.itemTypeTitle}>{item.itemType}</Text>
        <Text style={styles.itemDescription}>{item.itemDescription}</Text>
        <Text style={styles.rationale}>
          <Text style={styles.boldText}>Why it works:</Text>{" "}
          {item.stylingRationale}
        </Text>
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

        {index < results.styleRecommendations.length - 1 && (
          <View style={styles.itemDivider} />
        )}
      </View>
    ));
  };

  const renderStylingTips = () => {
    if (
      !results ||
      !results.generalStylingTips ||
      results.generalStylingTips.length === 0
    ) {
      return (
        <Text style={styles.noResultsText}>
          No general styling tips available.
        </Text>
      );
    }

    return results.generalStylingTips.map((tip, index) => (
      <View key={index} style={styles.tipItemContainer}>
        <Icon
          name="lightbulb-on-outline"
          size={20}
          color={theme.colors.secondary}
          style={styles.tipIcon}
        />
        <Text style={styles.tipText}>{tip}</Text>
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.featureCard}>
          <Card.Content>
            <View style={styles.featureHeader}>
              <Icon
                name="tshirt-crew"
                size={28}
                color={theme.colors.secondary}
              />
              <Text style={styles.featureTitle}>Analyze Your Style</Text>
            </View>
            <Text style={styles.featureDescription}>
              Take or upload a photo to get AI-powered fashion recommendations
              tailored to your body type and personal style.
            </Text>

            <View style={styles.imageSelectionContainer}>
              {image ? (
                <Image
                  source={{ uri: image.uri }}
                  style={[
                    styles.imagePreview,
                    { width: width * 0.8, height: (width * 0.8 * 5) / 3 },
                  ]}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.placeholderImage,
                    { width: width * 0.8, height: (width * 0.8 * 5) / 3 },
                  ]}
                >
                  <Icon name="account-tie-outline" size={80} color="#c5c5c5" />
                  <Text style={styles.placeholderText}>
                    Select or capture a full-body image (3:5 aspect ratio
                    preferred)
                  </Text>
                </View>
              )}

              <View style={styles.imageButtonContainer}>
                <Button
                  mode="contained"
                  onPress={() => selectImage(false)}
                  icon="image-multiple-outline"
                  style={styles.imageButton}
                  buttonColor={theme.colors.secondary}
                >
                  Gallery
                </Button>
                <Button
                  mode="contained"
                  onPress={() => selectImage(true)}
                  icon="camera-outline"
                  style={styles.imageButton}
                  buttonColor={theme.colors.secondary}
                >
                  Camera
                </Button>
              </View>

              <Button
                mode="contained"
                onPress={analyzeImage}
                disabled={!image || loading}
                icon={loading ? null : "tshirt-crew-outline"}
                style={styles.analyzeButton}
                buttonColor={theme.colors.primary}
                loading={loading}
              >
                {loading ? "Analyzing..." : "Analyze My Style"}
              </Button>

              {generatingImages && !loading && (
                <View style={styles.generatingIndicator}>
                  <Text style={styles.generatingText}>
                    Generating clothing images in background...
                  </Text>
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.secondary}
                  />
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {results && !loading && (
          <View style={styles.resultsContainer}>
            <Card style={styles.card}>
              <Card.Title
                title="Body Analysis"
                titleStyle={styles.cardTitle}
                left={(props) => (
                  <Icon
                    {...props}
                    name="human-greeting-variant"
                    size={24}
                    color={theme.colors.secondary}
                  />
                )}
              />
              <Card.Content>
                <Text style={styles.analysisText}>
                  {results.bodyAnalysisSummary || "No summary available."}
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Title
                title="Style Recommendations"
                titleStyle={styles.cardTitle}
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
                <View style={styles.recommendationsContentContainer}>
                  {renderStyleRecommendations()}
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Title
                title="General Styling Tips"
                titleStyle={styles.cardTitle}
                left={(props) => (
                  <Icon
                    {...props}
                    name="lightbulb-on-outline"
                    size={24}
                    color={theme.colors.secondary}
                  />
                )}
              />
              <Card.Content>
                <View style={styles.tipsContentContainer}>
                  {renderStylingTips()}
                </View>
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    fontFamily: "Georgia",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666666",
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  featureCard: {
    marginBottom: 20,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    marginLeft: 12,
    fontFamily: "Georgia",
  },
  featureDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666666",
    marginBottom: 16,
  },
  imageSelectionContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  imagePreview: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  placeholderImage: {
    borderRadius: 12,
    backgroundColor: "#f4f1ea", // Using theme's tertiaryContainer color
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  placeholderText: {
    marginTop: 12,
    color: "#6c757d",
    textAlign: "center",
    fontSize: 14,
  },
  imageButtonContainer: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-evenly",
    width: "100%",
  },
  imageButton: {
    marginHorizontal: 8,
    flex: 1,
    maxWidth: "45%",
  },
  analyzeButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    width: "90%",
  },
  resultsContainer: {
    marginTop: 24,
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
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#495057",
    fontFamily: "System",
  },
  recommendationsContentContainer: {
    gap: 16,
  },
  recommendationItemContainer: {
    marginBottom: 16,
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 16,
  },
  itemTypeTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#8C7A6B", // Using theme's secondary color
    marginBottom: 4,
    fontFamily: "Georgia",
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
  recommendationImage: {
    height: 220,
    width: "100%",
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  imagePlaceholder: {
    height: 220,
    width: "100%",
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#f4f1ea", // Using theme's tertiaryContainer color
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  tipsContentContainer: {
    gap: 12,
  },
  tipItemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  tipIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  tipText: {
    fontSize: 15,
    color: "#495057",
    lineHeight: 22,
    flex: 1,
  },
  noResultsText: {
    fontSize: 15,
    color: "#6c757d",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    fontStyle: "italic",
  },
  generatingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    backgroundColor: "#e9f7ff",
    padding: 8,
    borderRadius: 8,
  },
  generatingText: {
    fontSize: 14,
    color: "#8C7A6B", // Using theme's secondary color
    marginRight: 8,
  },
});

export default StyleScreen;
