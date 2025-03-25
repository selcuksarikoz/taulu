const urlMappings = {
  "https://web.whatsapp.com/": "persist:whatsapp-session",
  "https://messenger.com/": "persist:messenger-session",
  "https://www.messenger.com/": "persist:messenger-session",
  "https://discord.com/": "persist:discord-session",
  "https://www.facebook.com/": "persist:facebook-session",
  "https://www.instagram.com/": "persist:instagram-session",
  "https://twitter.com/": "persist:twitter-session",
  "https://x.com/": "persist:twitter-session",
  "https://www.tiktok.com/": "persist:tiktok-session",
  "https://www.snapchat.com/": "persist:snapchat-session",
  "https://www.linkedin.com/": "persist:linkedin-session",
  "https://web.telegram.org/": "persist:telegram-session",
  "https://chat.openai.com/": "persist:chatgpt-session",

  "https://www.google.com/": "persist:google-session",
  "https://mail.google.com/": "persist:gmail-session",
  "https://drive.google.com/": "persist:gdrive-session",
  "https://docs.google.com/": "persist:gdocs-session",
  "https://sheets.google.com/": "persist:gsheets-session",
  "https://slides.google.com/": "persist:gslides-session",
  "https://meet.google.com/": "persist:gmeet-session",
  "https://photos.google.com/": "persist:gphotos-session",
  "https://calendar.google.com/": "persist:gcalendar-session",
  "https://keep.google.com/": "persist:gkeep-session",
  "https://contacts.google.com/": "persist:gcontacts-session",
  "https://www.youtube.com/": "persist:youtube-session",
  "https://studio.youtube.com/": "persist:youtubestudio-session",

  "https://www.office.com/": "persist:office-session",
  "https://outlook.live.com/": "persist:outlook-session",
  "https://onedrive.live.com/": "persist:onedrive-session",
  "https://www.microsoft.com/": "persist:microsoft-session",
  "https://teams.microsoft.com/": "persist:teams-session",

  "https://www.reddit.com/": "persist:reddit-session",
  "https://www.twitch.tv/": "persist:twitch-session",
  "https://www.netflix.com/": "persist:netflix-session",
  "https://www.spotify.com/": "persist:spotify-session",
  "https://music.youtube.com/": "persist:ytmusic-session",
  "https://www.amazon.com/": "persist:amazon-session",
  "https://www.paypal.com/": "persist:paypal-session",
  "https://www.tumblr.com/": "persist:tumblr-session",
  "https://www.pinterest.com/": "persist:pinterest-session",
  "https://www.ebay.com/": "persist:ebay-session",
  "https://www.airbnb.com/": "persist:airbnb-session",
  "https://www.wikipedia.org/": "persist:wikipedia-session",
  "https://www.medium.com/": "persist:medium-session",
};

export function getSessionForUrl(inputUrl) {
  const matchedKey = Object.keys(urlMappings).find((key) => {
    const baseKey = key.replace(/(https?:\/\/)?(www\.)?/i, "").split("/")[0];
    const baseInput = inputUrl
      .replace(/(https?:\/\/)?(www\.)?/i, "")
      .split("/")[0];

    return baseInput === baseKey;
  });

  return matchedKey ? urlMappings[matchedKey] : null;
}
