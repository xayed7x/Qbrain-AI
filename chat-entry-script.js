// chat-entry-script.js
document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("chat-entry-loader");
  const logo = document.getElementById("loader-logo");
  const title = document.getElementById("loader-title");
  const subtitle = document.getElementById("loader-subtitle");
  const chatContainer = document.getElementById("chatbot-fullscreen-container");

  const chatbotUserInput = document.getElementById("chatbot-user-input");
  const chatbotSendButton = document.getElementById("chatbot-send-btn");
  const chatbotMessagesContainer = document.getElementById("chatbot-messages");
  const closeChatbotButton = document.getElementById("close-chatbot-btn");

  if (!loader || !chatContainer) {
    console.error("QBrain AI Chat: Loader or chat container not found.");
    if (chatContainer) chatContainer.style.opacity = 1; // Failsafe: show chat if loader fails
    return;
  }

  // Direct entry animation for chat.html
  const tl = gsap.timeline();

  // The loader div itself is already visible via CSS (opacity: 1)
  // We directly start animating its children which are initially hidden by CSS.
  tl.to(loader, { duration: 0.01 }) // Dummy tiny tween to ensure timeline starts if needed, or just chain from logo
    .fromTo(
      logo,
      { opacity: 0, scale: 0.8, y: 20, visibility: "hidden" }, // Match CSS
      {
        opacity: 1,
        scale: 1,
        y: 0,
        visibility: "visible",
        duration: 0.6,
        ease: "back.out(1.7)",
      }
    )
    .fromTo(
      title,
      { opacity: 0, y: 10, visibility: "hidden" }, // Match CSS
      {
        opacity: 1,
        y: 0,
        visibility: "visible",
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.4"
    )
    .fromTo(
      subtitle,
      { opacity: 0, y: 10, visibility: "hidden" }, // Match CSS
      {
        opacity: 1,
        y: 0,
        visibility: "visible",
        duration: 0.4,
        ease: "power2.out",
      },
      "-=0.3"
    )
    .to(
      logo,
      {
        // Subtle pulse/glow with brighter, whiter effect
        scale: 1.05, // Slightly increase scale during pulse
        // Use more intense white shadows for the pulse
        filter:
          "drop-shadow(0 0 8px rgba(255, 255, 255, 0.9)) " +
          "drop-shadow(0 0 20px rgba(255, 255, 255, 0.7)) " +
          "drop-shadow(0 0 40px rgba(255, 255, 255, 0.5))",
        yoyo: true,
        repeat: 1, // Pulse once (up and down)
        duration: 0.7, // Duration of the pulse animation
        ease: "sine.inOut",
      },
      "-=0.2"
    )
    .to(
      loader,
      {
        // Fade out loader
        opacity: 0,
        duration: 0.5,
        ease: "power1.in",
        onComplete: () => {
          loader.style.display = "none";
        },
      },
      "+=0.3"
    ) // Wait a bit after pulse
    .to(
      chatContainer,
      {
        // Fade in chat UI
        opacity: 1,
        visibility: "visible", // Use class if defined: .classList.add('visible')
        duration: 0.5,
        ease: "power1.out",
        onComplete: () => {
          if (chatbotUserInput) chatbotUserInput.focus();
        },
      },
      "-=0.3"
    ); // Overlap fade out of loader with fade in of chat

  // Basic Chatbot Send Functionality (Placeholder for chat.html)
  function addMessageToChatUI(text, type) {
    if (!chatbotMessagesContainer) return;
    const messageDiv = document.createElement("div");
    messageDiv.classList.add(
      "message",
      type === "user" ? "user-message" : "bot-message"
    );
    const p = document.createElement("p");
    // Sanitize text before inserting as HTML, or use textContent if no HTML is needed
    // For simplicity here, assuming text is safe or will be simple strings.
    // For user input, always sanitize if rendering as HTML.
    p.innerHTML = text.replace(/\n/g, "<br>"); // Allow line breaks
    messageDiv.appendChild(p);
    chatbotMessagesContainer.appendChild(messageDiv);
    chatbotMessagesContainer.scrollTop = chatbotMessagesContainer.scrollHeight; // Auto-scroll
  }

  if (chatbotSendButton && chatbotUserInput) {
    chatbotSendButton.addEventListener("click", () => {
      const userText = chatbotUserInput.value.trim();
      if (userText) {
        addMessageToChatUI(userText, "user");
        chatbotUserInput.value = "";
        // TODO: Send userText to your AI backend
        setTimeout(() => {
          addMessageToChatUI(
            "I'm QBrain, processing your request... (Demo response)",
            "bot"
          );
        }, 1000);
      }
    });

    chatbotUserInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        // Send on Enter, allow Shift+Enter for newline
        e.preventDefault();
        chatbotSendButton.click();
      }
    });
  }

  if (closeChatbotButton) {
    closeChatbotButton.addEventListener("click", () => {
      // Redirect to homepage or previous page
      window.location.href = "index.html"; // Or history.back() if appropriate
    });
  }
});
