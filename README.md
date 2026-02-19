# Profile-Hub 

A premium, state-of-the-art Personal Portfolio and Project Showcase application. Built with a focus on rich aesthetics, smooth interactions, and ultimate user experience.

## Features

-   **Dynamic Portfolio**: Showcase your personal details, skills, and professional journey with a sleek, modern UI.
-   **Project Management**: Add, edit, and delete projects in real-time with **Optimistic UI** (no lag!).
-   **Direct Media Upload**: Upload your profile photo directly from your system (Base64 optimized).
-   **AI-Powered Bio**: Generate professional biographies using integrated AI templates.
-   **Premium Aesthetics**:
    -   Adaptive Dark/Light mode with persistence.
    -   Vibrant gradients and glassmorphism components.
    -   Smooth micro-animations using Framer Motion.
-   **Fully Responsive**: Optimized for desktop, tablet, and mobile viewing.

## Tech Stack

### Frontend
-   **React 19** + **TypeScript**
-   **Tailwind CSS** (for styling)
-   **Framer Motion** (for animations)
-   **Shadcn UI** (accessible components)
-   **Wouter** (lightweight routing)
-   **React Query** (advanced state management & caching)

### Backend
-   **Node.js / Express**
-   **Drizzle ORM** (structured data modeling)
-   **Zod** (strict schema validation)

## Getting Started

### Prerequisites
-   Node.js v20+
-   npm

### Installation
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:5001](http://localhost:5001) in your browser.

## Deployment (Render)

This project is pre-configured for **Render**.

1.  Push your code to a GitHub repository.
2.  In the Render Dashboard, click **New > Blueprint**.
3.  Connect your repository.
4.  Render will automatically use the `render.yaml` configuration to build and deploy your application.

## Scripts
-   `npm run dev`: Starts the development server with HMR.
-   `npm run build`: Compiles the frontend and backend for production.
-   `npm start`: Runs the production-ready application from the `dist` folder.
-   `npm run check`: Performs a full TypeScript type check.

## License
MIT License. Feel free to use and adapt this for your own professional profile!
