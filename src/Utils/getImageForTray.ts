// Function to create nativeImage from URL
import { nativeImage } from "electron";

export async function getImageForTray(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create nativeImage directly from buffer
    return nativeImage.createFromBuffer(buffer);
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}
