
// Node.js code example for downloading an image
// For more details, visit: https://github.com/pollinations/pollinations/blob/master/APIDOCS.md

import fs from 'fs';
import fetch from 'node-fetch';
import { getImagePrompt } from 'route.js';
async function downloadImage(imageUrl) {
  // Fetching the image from the URL
  const response = await fetch(imageUrl);
  // Reading the response as a buffer
  const buffer = await response.buffer();
  // Writing the buffer to a file named 'image.png'
//   fs.writeFileSync('image.png', buffer);
  // Logging completion message
  console.log('Download Completed');
}


// Image details
const prompt = getImagePrompt();
const width = 1845;
const height = 1038;
const seed = 59765; // Each seed generates a new image variation
const model = 'flux'; // Using 'flux' as default if model is not provided

const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=${model}`;

downloadImage(imageUrl);
