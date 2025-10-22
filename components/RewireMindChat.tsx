import React, { useEffect, useRef } from 'react';

const CHATBOT_ID = "d84bfb5c-74d9-4df1-9857-d37c7e470aff";
const SCRIPT_URL = "https://cdn.jsdelivr.net/npm/@denserai/embed-chat@1/dist/web.min.js";

// This is a global object from the script, so we need to declare it for TypeScript
declare global {
    interface Window {
        Chatbot?: { // The class/module
            init: (config: { chatbotId: string; }) => void;
        };
        denseraiChatbot?: { // The instance created by init()
            open: () => void;
        };
    }
}

const RewireMindChat: React.FC = () => {
    const scriptAdded = useRef(false);

    useEffect(() => {
        // --- Aggressive CSS Injection to permanently hide the default chat button ---
        const styleId = 'denser-ai-hide-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
              div[data-chatbot-id="${CHATBOT_ID}"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
              }
            `;
            document.head.appendChild(style);
        }

        // --- Original script loading logic ---
        if (scriptAdded.current) {
            return;
        }

        const scriptId = 'denser-ai-chatbot-script';
        if (document.getElementById(scriptId) || window.denseraiChatbot) {
            scriptAdded.current = true;
            return;
        }
        
        const scriptContent = `
          try {
            const module = await import('${SCRIPT_URL}');
            const Chatbot = module.default;
            window.Chatbot = module.default; // Expose for debugging
            if (Chatbot && typeof Chatbot.init === 'function') {
                Chatbot.init({ 
                    chatbotId: "${CHATBOT_ID}"
                });
            } else {
                console.error("Rewire The Mind chatbot module loaded, but 'init' function was not found.");
            }
          } catch (e) {
            console.error("Failed to import or initialize the Rewire The Mind chatbot module:", e);
          }
        `;

        try {
            const blob = new Blob([scriptContent], { type: 'application/javascript' });
            const objectURL = URL.createObjectURL(blob);
            const script = document.createElement('script');
            script.id = scriptId;
            script.type = 'module';
            script.src = objectURL;
            scriptAdded.current = true;
            script.onload = () => URL.revokeObjectURL(objectURL);
            script.onerror = (e) => {
                console.error("An error occurred while loading the Rewire The Mind chatbot script.", e);
                URL.revokeObjectURL(objectURL);
                scriptAdded.current = false;
            };
            document.body.appendChild(script);
        } catch (e) {
            console.error("Failed to create the chatbot script element from a Blob:", e);
            scriptAdded.current = false;
        }

    }, []); // Empty dependency array ensures this runs only once on mount.

    return null; // This component does not render any UI.
};

export default RewireMindChat;