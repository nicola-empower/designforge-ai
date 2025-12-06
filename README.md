# DesignForge AI

DesignForge AI is a comprehensive web design visualization and blueprinting tool powered by Google's Gemini models. It allows developers and designers to conceptualize interfaces instantly, generate assets, and create technical specifications for their projects.

## Features

### 1. Interactive Design Playground
*   **Visual Editor:** Real-time controls for layout modes (Landing, Dashboard, E-commerce, Blog, Portfolio), typography, colors, and grid systems.
*   **Live Preview:** Instantly visualize changes across different common web layouts.
*   **Deferred Rendering:** Optimized performance using React `useDeferredValue` to keep inputs responsive even during complex renders.
*   **Component Library:** View how your design system applies to common UI components (Buttons, Inputs, Cards).
*   **History Management:** Robust Undo/Redo functionality with keyboard shortcuts (`Ctrl+Z`, `Ctrl+Y`).
*   **Auto-Save:** LocalStorage integration ensures you never lose your work.

### 2. AI Design Assistant (Chat)
*   **Powered by Gemini 3 Pro:** Context-aware chat that acts as a Senior Design Engineer.
*   **Tool Use:** The AI can programmatically update the Playground state. You can say *"Make the primary color a deep blue"* or *"Switch to a dashboard layout"*, and the app updates instantly.
*   **Accessibility Monitoring:** The AI proactively analyzes color contrast (WCAG) against the dark mode background and can automatically suggest fixes.

### 3. Image Studio
*   **Asset Generation:** Create high-fidelity placeholders and assets using **Nano Banana Pro** (`gemini-3-pro-image-preview`). Supports 1K, 2K, and 4K resolutions.
*   **Image Editing:** Upload an image and use text prompts to edit it using **Nano Banana** (`gemini-2.5-flash-image`).

### 4. Project Blueprint
*   **Technical Specs:** Generates a detailed "Astro + React" technical specification based on your current visual configuration.
*   **Tailwind Config:** Provides a copy-pasteable `tailwind.config.js` snippet matching your variables.
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
    *   **Important:** Ensure your project has billing enabled if you plan to use the Video or High-Fidelity Image generation features (though this app primarily uses Image and Text models).

2.  **Configure the Key:**
    *   Create a `.env` file in the root of your project.
    *   Add the following line:
        ```env
        API_KEY=your_actual_api_key_here
        ```
    *   *Note:* If you are using a bundler like Vite, you might need to prefix this variable (e.g., `VITE_API_KEY`) and update `services/geminiService.ts` accordingly, or use a plugin that exposes `process.env`.

### Installation & Running

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Start the development server:
    ```bash
    npm run dev
    ```

3.  Open your browser to `http://localhost:5173` (or the port shown in your terminal).

---

## AI Models Used

This application utilizes specific models from the `@google/genai` SDK:

*   **Logic & Chat:** `gemini-3-pro-preview`
    *   Used for the Chat Assistant and generating Project Blueprints.
    *   Selected for its complex reasoning capabilities and tool calling support.
*   **Image Generation:** `gemini-3-pro-image-preview`
    *   Used in the Image Studio for creating new assets from scratch.
*   **Image Editing:** `gemini-2.5-flash-image`
    *   Used in the Image Studio for modifying existing images.

## Technologies

*   **Frontend:** React 19, TypeScript
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **AI SDK:** Google GenAI SDK (`@google/genai`)
*   **Utilities:** `jspdf` for document generation.
