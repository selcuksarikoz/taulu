export function mapDimensions(url: string): {
  width: number;
  height: number;
  aspectRatio: string;
} {
  let width: number, height: number, aspectRatio: string;

  if (url.includes("music")) {
    width = 400;
    height = 600;
    aspectRatio = "3/4";
  } else if (url.includes("youtu")) {
    width = 560;
    height = 315;
    aspectRatio = "16/9";
  } else if (url.includes("spotify")) {
    aspectRatio = "3/4";

    width = 300;
    height = (width / 3) * 4;
  } else {
    return {
      width: 500,
      height: 500,
      aspectRatio: "9/16",
    };
  }

  // Ensure height is an integer for spotify
  if (url.includes("spotify.com")) {
    height = Math.round(height);
  }

  return {
    width: width,
    height: height,
    aspectRatio: aspectRatio,
  };
}
