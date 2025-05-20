import axios from "axios";
import { Buffer } from "buffer";

const HUGGING_FACE_API_TOKEN = "API_KEY";
const HUGGING_FACE_MODEL_ID = "black-forest-labs/FLUX.1-dev";
const HUGGING_FACE_API_URL = `https://api-inference.huggingface.co/models/${HUGGING_FACE_MODEL_ID}`;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateClothingImage = async (
  description,
  retries = 3,
  retryDelay = 2000
) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(
        `Generating image (attempt ${attempt}/${retries}) using ${HUGGING_FACE_MODEL_ID} for: ${description}`
      );

      const prompt = `${description}, product photography on plain white background, professional studio lighting, high resolution, detailed texture, centered composition, clean edges`;
      const negative_prompt =
        "worst quality, low quality, distorted, blurry, noisy, text, watermark, logo, multiple items, cluttered background, colored background, people, person, human, hands, low resolution, ugly, deformed, amateur, unprofessional";

      const response = await axios.post(
        HUGGING_FACE_API_URL,
        {
          inputs: prompt,
          parameters: {
            negative_prompt: negative_prompt,
            height: 768,
            width: 768,
            num_inference_steps: 25,
            guidance_scale: 7.5,
            seed: Math.floor(Math.random() * 1000000),
          },
          options: {
            use_cache: false,
            wait_for_model: true,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${HUGGING_FACE_API_TOKEN}`,
            "Content-Type": "application/json",
            Accept: "image/jpeg",
          },
          responseType: "arraybuffer",
          timeout: 120000,
        }
      );

      if (response.status === 200 && response.data) {
        const imageBase64 = Buffer.from(response.data, "binary").toString(
          "base64"
        );
        const imageUrl = `data:image/jpeg;base64,${imageBase64}`;
        console.log("Image generated successfully via Hugging Face.");
        return imageUrl;
      } else {
        throw new Error(`Hugging Face API returned status ${response.status}`);
      }
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const isTimeoutError =
        error.code === "ECONNABORTED" ||
        (error.response && error.response.status === 504);

      if (isLastAttempt) {
        let detailedError = error.message;
        if (error.response && error.response.data) {
          detailedError += ` | Status: ${error.response.status}`;
          try {
            const errorResponseText = Buffer.from(error.response.data).toString(
              "utf-8"
            );
            detailedError += ` | Data: ${errorResponseText.substring(
              0,
              200
            )}...`;
          } catch (e) {
            detailedError += " | Failed to decode error response data.";
          }
        }
        throw new Error(`Failed to generate clothing image: ${detailedError}`);
      } else {
        console.warn(`Attempt ${attempt} failed: ${error.message}`);
        if (isTimeoutError) {
          console.log(`Gateway timeout detected. Retrying after delay...`);
        }

        await delay(retryDelay);
      }
    }
  }
};

export const generateMultipleClothingImages = async (descriptionsArray) => {
  const results = [];

  for (let i = 0; i < descriptionsArray.length; i++) {
    try {
      console.log(`Processing image ${i + 1}/${descriptionsArray.length}`);

      if (i > 0) await delay(1000);

      const imageUrl = await generateClothingImage(descriptionsArray[i]);
      results.push({ success: true, imageUrl, index: i });
    } catch (error) {
      console.error(`Error generating image for item ${i + 1}:`, error);
      results.push({ success: false, error: error.message, index: i });
    }
  }

  return results;
};
