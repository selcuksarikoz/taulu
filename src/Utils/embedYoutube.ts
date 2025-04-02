/**
 * Extract video ID from any YouTube URL format and create a clean embed URL
 * @param {string} url - Any YouTube URL
 * @returns {string} Clean YouTube embed URL with random si parameter
 */
export function extractYouTubeVideoUrl(url: string) {
  try {
    let videoId = "";

    // Handle all YouTube URL formats
    if (url.includes("youtube.com/watch")) {
      // Standard watch URL: youtube.com/watch?v=ID
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get("v") as string;
    } else if (url.includes("youtu.be/")) {
      // Short URL: youtu.be/ID
      videoId = url.split("youtu.be/")[1];
    } else if (url.includes("youtube.com/embed/")) {
      // Embed URL: youtube.com/embed/ID
      videoId = url.split("youtube.com/embed/")[1];
    }

    // Clean up the video ID by removing any parameters
    if (videoId.includes("?")) {
      videoId = videoId.split("?")[0];
    }
    if (videoId.includes("&")) {
      videoId = videoId.split("&")[0];
    }

    // Check if we successfully extracted a video ID
    if (!videoId) {
      console.info("Could not extract YouTube video ID from URL:", url);
      return url;
    }

    return `https://www.youtube.com/embed/${videoId}?si=${crypto.randomUUID()}&controls=1&autoplay=1&rel=0`;
  } catch (error) {
    console.error("Error processing YouTube URL:", error);
    return null;
  }
}
