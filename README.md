<div align="center">
  <a href="https://genai-hack-global.vercel.app/">
    <img alt="OmniAI logo" src="./public/logo.png" height="128">
  </a>
    <!-- omit in toc -->
  <h1 style="border: none;">OmniAI</h1>
    <!-- omit in toc -->
  <h3 style="color: #868686;">Turn Headlines Into Highlights</h3>
</div>

---

*Are you struggling to keep your audience engaged with fresh, eye-catching content?*

Our app finds the latest news and instantly turns it into stunning posts, videos, and memes—perfect for any platform. Engage effortlessly and stay ahead!

---

<a href="https://genai-hack-global.vercel.app/" target="_blank"><img alt="chatbot button" src="./public/chatbot_button.svg"></a>

<!-- omit in toc -->
## **👇 Click the image to watch the demo video**
[![Watch the video](./public/embed.png)](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

<!-- omit in toc -->
### News Articles, Summarized for:  
- **Memes**  
- **Text Posts**  
- **Images**  
- **Videos**

---

<!-- omit in toc -->
## 📑 Table of Contents

- [🚀 Features](#-features)
- [🧠 Usage](#-usage)
- [🛠️ Getting Started](#️-getting-started)
  - [📋 Prerequisites](#-prerequisites)
  - [🏁 Installation Steps](#-installation-steps)
- [🤖 AI APIs Utilized](#-ai-apis-utilized)
- [📄 Additional Documentation](#-additional-documentation)

## 🚀 Features
- [x] Dropdown for tone and format
- [x] Dropdown for platform
- [x] Iterative adjustments/refinements based on follow-up prompts
- [x] Iterative adjustments/refinements based on follow-up prompts with alternative formats
- [x] Text format generation
- [x] Video format generation
- [x] Image format generation
- [x] Meme format generation - with edit caption functionality
- [x] Choose any format generation
- [x] Displays all formats on a single landing page with tab-based previews.
- [ ] Suggests trending and relevant topics based on platform-specific analytics

## 🧠 Usage

(TODO: Update usage instructions after completing the demo video.)

## 🛠️ Getting Started

### 📋 Prerequisites

Before starting, ensure you have the following:

1. [Node.js](https://nodejs.org/en/download/package-manager) - Required runtime environment.
2. [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) - Package manager for JavaScript.
3. API Keys:
   - [Groq](https://groq.com/): Refer to the [instructions](https://console.groq.com/keys) to create and retrieve your API key.
   - [Novita AI](https://novita.ai/): Refer to the [quickstart guide](https://novita.ai/docs/get-started/quickstart.html#_1-go-to-novita-ai-and-log-in) to obtain your API key.
   - [NewsAPI](https://newsapi.org/): Refer to the [documentation](https://newsapi.org/docs/get-started) for API key generation.

### 🏁 Installation Steps

1. **Clone the Repository:**
    ```bash
    git clone https://github.com/Kulsgam/genai_hack_global.git
    cd genai_hack_global
    ```

2. **Configure the Environment Variables:**
    - Create a `.env` file in the root directory.
    - Add your API keys as follows or as outlined in [example.env](./example.env):
      ```
      GROQ_API_KEY=<GROQ_API_KEY>
      NOVITA_API=<NOVITA_API>
      NEWS_API_KEY=<NEWS_API_KEY>
      ```

3. **Install Dependencies:**
    - Run the following command to install all dependencies:
      ```bash
      npm install
      ```

4. **Start the Application:**
    - Run the application locally with:
      ```bash
      npm run dev
      ```
    - Open the deployed URL ([Default URL](http://localhost:3000)) in your browser to view the app.


# Project Tech Stack

This project utilizes the following technologies and tools:

## Frontend

### [Next.js](https://nextjs.org/)
A React-based framework for building server-rendered and statically generated web applications.

### [TypeScript](https://www.typescriptlang.org/)
A strongly typed programming language that builds on JavaScript, giving you better tooling and safer code.

### [TailwindCSS](https://tailwindcss.com/)
A utility-first CSS framework for creating custom user interfaces efficiently.

### [Radix UI](https://www.radix-ui.com/)
A set of accessible, unstyled UI components for building high-quality web applications.

## 🤖 AI APIs Utilized


### [News API](https://newsapi.org/)
An API for fetching the latest news articles from various sources and topics. This API allows seamless integration of real-time news data into your application, providing updated and relevant content for users.

### [Novita.ai](https://novita.ai/)
Novita.ai offers an advanced video generation API that simplifies the creation of dynamic and engaging video content. It is ideal for projects requiring automated video production with personalized and customizable elements.

### [Groq](https://groq.com/)
Groq, featuring the Llama3 large language model capabilities, provides robust tools for querying and transforming structured content. This is particularly valuable for enhancing AI-driven functionalities and data interactions in projects.

### [Pollination.ai](https://pollinations.ai/)
Pollination.ai delivers a cutting-edge image generation API, enabling the creation of high-quality visual assets for your application. Its flexibility and power make it an excellent choice for projects involving custom visualizations or automated design solutions.

# Workflows

## Summarizer
- **Input**: Article links are provided by the user.
- **Process**:
  1. A web crawler fetches and extracts text content from the provided article links.
  2. The extracted text is sent to Groq's Llama3 large language model.
- **Output**: Groq's Llama3 processes the content and returns a concise and summarized version of the input text.

## Text Generation

- **Input**: User provides a text prompt.
- **Process**:
  1. **Prompt Adjustment**: The input prompt is optimized using the Groq API.
  2. **Keyword Search**: Keywords are generated from the prompt, and News API is queried if news data is enabled.
  3. **Content Creation**: The adjusted prompt and optional news content are used for Groq-based text generation.
- **Output**: The generated content is returned, along with referenced news links (if any).

## Video Generation

- **Input**: User provides a prompt.
- **Process**:
  1. **Prompt Optimization**: Groq's Llama3 processes the user’s query and enriches the prompt for video generation.
  2. **Video Creation**: The enriched prompt is sent to Novita.ai's Text-to-Video API to generate captivating video content.
  3. **Text Overlay**: The generated video is enhanced with text overlays using FFMPEG.
- **Output**: The final video is ready for posting, complete with overlays and dynamic visuals.

## Image Generation

- **Input**: User provides a text prompt.
- **Process**:
  1. **Prompt Adjustment**: The user prompt is refined and enhanced using the Groq API to generate a better prompt.
  2. **Prompt Integration**: The improved prompt is appended with an online API link.
  3. **Image Generation**: The Pollination API is called with the adjusted prompt and returns the link to the generated image.
- **Output**: A high-quality image is generated and returned via the provided link.

## Meme Generation

- **Input**: User provides a text prompt and optional generated text.
- **Process**:
  1. **Punchline Creation**: Groq's Llama3 generates a punchline and an image prompt based on the input.
  2. **Image Generation**: The image prompt is sent to the Pollination API to create an image.
  3. **Image Manipulation**: The generated image is processed using an image buffer manipulator.
  4. **Punchline Overlay**: The punchline is added to the image buffer manipulator to create the final meme.
- **Output**: The final meme is a combination of the punchline and the generated image.

## 📄 Additional Documentation
- Text generation is often used as context for other media generation. Therefore if the text is regenerated, the user might want to regenerate the other media to 'sync' it.

### Future Work

- Speech Recognition
- Profile and Account System for Chat History
- Desktop App and Mobile Applications

Stay tuned for more details and usage guides coming soon!
