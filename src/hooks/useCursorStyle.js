import { useEffect } from 'react';

const useCursorStyle = () => {
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    style.innerHTML = `
      .game-container {
        cursor: none !important;
      }
      .game-container canvas {
        cursor: none !important;
      }
      body {
        overflow: hidden; /* Prevent scrolling */
      }
    `;
    // Add it to the head
    document.head.appendChild(style);

    // Clean up
    return () => {
      document.head.removeChild(style);
    };
  }, []);
};

export default useCursorStyle; 