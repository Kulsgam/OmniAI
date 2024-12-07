// const API_KEY = '6d572db3c6845247f5ad001774f51a37';  // Replace with your API key from imgbun
// const PROMPT = 'A cartoon of a robot performing stand-up comedy';

// async function generateImage(prompt: string) {
//   try {
//     const response = await fetch('https://imgbun.com/api/v1/generate', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${API_KEY}`
//       },
//       body: JSON.stringify({ prompt })
//     });

//     if (!response.ok) {
//       throw new Error('Failed to generate image');
//     }

//     const data = await response.json();
//     return data.imageUrl;  // URL of the generated image
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// generateImage(PROMPT).then(imageUrl => {
//   console.log('Generated Image URL:', imageUrl);
// });
