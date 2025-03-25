// import { OAuth2Client } from "google-auth-library";
//
// export const initOAuthClient = () => {
//   return new OAuth2Client({
//     clientId:
//       "945425986788-6o324ot7eqb9irg6pvqnmg6s92s0dn9m.apps.googleusercontent.com",
//     clientSecret: "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",
//     redirectUri: "urn:ietf:wg:oauth:2.0:oob",
//   });
// };
//
// export const getTokensDirectly = (authWindow, authUrl, oauthClient) => {
//   return new Promise((resolve, reject) => {
//     let isHandled = false;
//
//     // Handle window closed manually
//     authWindow.on("closed", () => {
//       if (!isHandled) {
//         reject(new Error("Authentication cancelled"));
//       }
//     });
//
//     // Listen for the redirect containing the auth code
//     authWindow.webContents.on("will-redirect", async (_event, url) => {
//       try {
//         const urlObj = new URL(url);
//
//         // Check for success with code parameter
//         const code =
//           urlObj.searchParams.get("code") ||
//           urlObj.searchParams.get("approvalCode");
//         if (code) {
//           isHandled = true;
//
//           // Get tokens using the code
//           const response = await oauthClient.getToken(code);
//           authWindow.close();
//           resolve(response.tokens);
//           return;
//         }
//
//         // Check for error response
//         const error = urlObj.searchParams.get("error");
//         if (error) {
//           isHandled = true;
//           authWindow.close();
//           reject(new Error(`Authentication error: ${error}`));
//           return;
//         }
//       } catch (err) {
//         console.error("Error processing redirect:", err);
//       }
//     });
//
//     // For Google's OOB flow, where code appears in the page
//     authWindow.webContents.on("did-finish-load", async () => {
//       const currentUrl = authWindow.webContents.getURL();
//
//       // Check if we're on the approval page where code is displayed
//       if (
//         currentUrl.includes("google.com/approval") ||
//         currentUrl.includes("accounts.google.com/o/oauth2/approval")
//       ) {
//         try {
//           // Try to extract code from the page
//           const extractedCode = await authWindow.webContents.executeJavaScript(`
//             (function() {
//               // Try to get code from textarea or pre element
//               const textArea = document.querySelector('textarea');
//               if (textArea && textArea.value) return textArea.value;
//
//               const preElement = document.querySelector('pre');
//               if (preElement && preElement.textContent) return preElement.textContent;
//
//               // Try to get code displayed in the page content
//               const codePattern = /[\\w-]{30,}/;
//               const match = document.body.textContent.match(codePattern);
//               return match ? match[0] : null;
//             })();
//           `);
//
//           if (extractedCode) {
//             isHandled = true;
//
//             // Get tokens using the extracted code
//             const response = await oauthClient.getToken(extractedCode);
//             authWindow.close();
//             resolve(response.tokens);
//           }
//         } catch (err) {
//           console.error("Error extracting code from page:", err);
//         }
//       }
//     });
//
//     // Load the authorization URL
//     authWindow.loadURL(authUrl);
//   });
// };
