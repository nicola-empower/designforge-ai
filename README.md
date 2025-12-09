# DesignForge AI

DesignForge AI is a comprehensive web design visualisation and blueprinting tool powered by Google's Gemini models. It allows developers and designers to conceptualise interfaces instantly, generate assets, and create technical specifications for their projects.

<img width="2828" height="1504" alt="image" src="https://github.com/user-attachments/assets/8b49bb65-9f1d-435f-8178-f4f1fd343965" />

## Features

### 1. Interactive Design Playground
*   **Visual Editor:** Real-time controls for layout modes (Landing, Dashboard, E-commerce, Blog, Portfolio), typography, colours, and grid systems.
*   **Live Preview:** Instantly visualise changes across different common web layouts.
*   **Component Library:** View how your design system applies to common UI components (Buttons, Inputs, Cards).
*   **History Management:** Robust Undo/Redo functionality with keyboard shortcuts (`Ctrl+Z`, `Ctrl+Y`).
*   **Auto-Save:** LocalStorage integration ensures you never lose your work.

### 2. AI Design Assistant (Chat)
*   **Powered by Gemini 3 Pro:** Context-aware chat that acts as a Senior Design Engineer.
*   **Tool Use:** The AI can programmatically update the Playground state.
*   **Accessibility Monitoring:** Proactively analyses colour contrast (WCAG) and suggests fixes.

### 3. Image Studio
*   **Asset Generation:** Create high-fidelity placeholders and assets using **Nano Banana Pro** (`gemini-3-pro-image-preview`).
*   **Image Editing:** Upload an image and use text prompts to edit it using **Nano Banana** (`gemini-2.5-flash-image`).

### 4. Project Blueprint
*   **Technical Specs:** Generates a detailed "Astro + React" technical specification.
*   **Tailwind Config:** Provides a copy-pasteable `tailwind.config.js` snippet.
*   **PDF Export:** Download professional PDF reports of your design blueprint.

---

## Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   npm, yarn, or pnpm

### Environment Setup

**Critical Step:** This application relies on the Google GenAI SDK. You must provide a valid API Key.

1.  **Get an API Key:**
    *   Visit [Google AI Studio](https://aistudio.google.com/).
    *   Create a new API key.

2.  **Configure the Key:**
    *   Create a `.env.local` file in the root of your project.
    *   Add the following line:
        ```env
        VITE_API_KEY=your_actual_api_key_here
        ```
    *   **Note:** The variable MUST be named `VITE_API_KEY` for the frontend to access it.

### Installation & Running

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the development server:**
    ```bash
    npm run dev
    ```

3.  **Open your browser:**
    *   Visit `http://localhost:3000` (or `http://localhost:3001` if port is busy).

---

## Project Structure

This project follows a standard Vite + React structure:

```
designforge-ai/
├── src/
│   ├── components/    # React components (Playground, ChatBot, etc.)
│   ├── services/      # API integrations (geminiService.ts)
│   ├── App.tsx        # Main application component
│   └── index.css      # Global styles (Tailwind directives)
├── .env.local         # Environment variables (Git-ignored)
├── tailwind.config.js # Tailwind CSS configuration
└── vite.config.ts     # Vite configuration
```

## Technologies

*   **Frontend:** React 19, TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS (v3)
*   **Icons:** Lucide React
*   **AI SDK:** Google GenAI SDK (`@google/genai`)
*   **Utilities:** `jspdf` for document generation.


Nicola Berry | Empower Digital Solutions | nicola@empowerdigitalsolutions.co.uk | https://empowerdigitalsolutions.co.uk
