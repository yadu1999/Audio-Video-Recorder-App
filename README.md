# Audio & Video Recorder App

A sleek and modern web application built with React, Vite, TailwindCSS, shadcn/ui, and Framer Motion that allows users to record audio and/or video, preview recordings, download them, and manage a list of past recordings.

## ✨ Features

*   **Audio Recording:** Capture audio using the device's microphone.
*   **Video Recording:** Capture video (with audio) using the device's camera and microphone.
*   **Live Preview:** See a live camera feed during video recording.
*   **Audio Visualizer:** A simple visualizer for audio-only recording mode.
*   **Recording Controls:** Intuitive record, pause, resume, and stop buttons.
*   **Recording Timer:** Displays the duration of the current recording.
*   **Post-Recording Preview:** Preview audio or video immediately after recording.
*   **Download Recordings:** Download recordings in `.webm` format.
*   **Save Recordings:** Store recordings in `localStorage` to persist them across sessions.
*   **Recording Library:** View a list of previously saved recordings with options to play, download, or delete.
*   **Mode Toggling:** Easily switch between audio-only and video+audio recording modes.
*   **Graceful Permission Handling:** Clear feedback and prompts for microphone/camera access.
*   **Responsive Design:** User interface adapts to various screen sizes.
*   **Modern UI/UX:** Clean, intuitive, and visually appealing design with smooth animations.
*   **Toast Notifications:** User-friendly notifications for actions and errors.

## 🚀 Steps to Run Locally

1.  **Clone the repository (or export the project):**
   
    git clone https://github.com/yadu1999/Audio-Video-Recorder-App.git
    cd Audio-Video-Recorder-App
   
   

2.  **Install dependencies:**
    Make sure you have Node.js (v20 recommended) and npm installed.
   
    npm install
   

3.  **Run the development server:**
   
    npm run dev
   
    This will start the Vite development server, typically on `http://localhost:5173`. Open this URL in your browser.

4.  **Build for production (optional):**
   
    npm run build
   
    This command bundles the app into static files for production in the `dist` folder.

## 🌟 Bonus Features Implemented

*   **Toggle between audio-only and video mode:** Fully implemented with UI controls.
*   **Timer showing recording duration:** Clearly displayed during recording.
*   **Show list of past recordings (in-memory or with localStorage):** Implemented using `localStorage` for persistence. Users can view, play, download, and delete past recordings.
*   **Handle permissions gracefully (mic/camera access errors):** Implemented with clear UI feedback and prompts to retry permissions.
*   **Responsive UI/UX:** The application is designed to be responsive and work well on different screen sizes.
*   **Animations & Transitions:** Framer Motion is used for smooth page transitions and interactive element animations.
*   **Toast Notifications:** shadcn/ui toasts provide feedback for various user actions.

## 🤔 Issues Faced or Trade-offs

*   **Browser Compatibility for MediaRecorder API:**
    *   The `MediaRecorder` API's support for specific codecs (like `.mp3` or `.mp4` directly) can vary across browsers. The app currently defaults to `.webm` as it has broad support for both audio and video. Converting to other formats would typically require server-side processing or a client-side library (which adds to bundle size).
*   **`localStorage` Limitations for Blob URLs:**
    *   Directly storing `Blob` objects or their `blob:URL`s in `localStorage` is not straightforward for long-term persistence, as `blob:URL`s are tied to the current document session. The app currently saves metadata and re-creates `blob:URL`s for recordings made in the current session. For recordings loaded from `localStorage` from previous sessions, the direct download might not work if the original blob data isn't available (a toast notification informs the user about this). A more robust solution for persistent storage of actual media data would involve a backend service like Supabase Storage or Firebase Storage.
*   **Video Preview Stability:**
    *   Ensuring the video preview remains consistently active and updates correctly with stream state changes (e.g., camera unplugged, permissions revoked mid-session) requires careful management of the `MediaStream` object and its tracks. The current implementation aims for robustness but edge cases across different browsers/devices might still occur.
*   **Resource Cleanup:**
    *   Properly releasing `MediaStream` tracks and revoking `objectURL`s is crucial to avoid memory leaks. The app includes cleanup logic in `useEffect` hooks, particularly on component unmount and when recordings are deleted or new ones are made.

## 🛠️ Technologies Used

*   **Vite:** Build tool and development server.
*   **React 18.2.0:** JavaScript library for building user interfaces.
*   **TailwindCSS 3.3.2:** Utility-first CSS framework for styling.
*   **shadcn/ui:** Beautifully designed components built with Radix UI and Tailwind CSS.
*   **Lucide React 0.292.0:** Icon library.
*   **Framer Motion 10.16.4:** Animation library for React.
*   **JavaScript (ES6+):** Programming language.
*   **`navigator.mediaDevices.getUserMedia`:** Web API for accessing media input devices.
*   **`MediaRecorder` API:** Web API for recording audio and video.
*   **`localStorage`:** Web Storage API for client-side data persistence.
