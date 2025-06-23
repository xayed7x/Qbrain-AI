// chat-entry-script.js (Fully Corrected for Mobile Keyboard)

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

  const API_URL = "https://xayed7x-qbrain-ai-backend.hf.space/api/chat"; // Your live backend URL

  if (!loader || !chatContainer) {
    console.error("QBrain AI Chat: Loader or chat container not found.");
    if (chatContainer) chatContainer.style.opacity = 1;
    return;
  }

  // ---- NEW: Create a reusable function to scroll the chat to the bottom ----
  function scrollToBottom() {
    if (chatbotMessagesContainer) {
      // Use smooth scrolling for a nicer effect
      chatbotMessagesContainer.scrollTo({
        top: chatbotMessagesContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }

  // Direct entry animation for chat.html (No changes here)
  const tl = gsap.timeline();
  tl.to(loader, { duration: 0.01 })
    // ... (rest of the GSAP animation code is unchanged)
    .fromTo(
      logo,
      { opacity: 0, scale: 0.8, y: 20, visibility: "hidden" },
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
      { opacity: 0, y: 10, visibility: "hidden" },
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
      { opacity: 0, y: 10, visibility: "hidden" },
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
        scale: 1.05,
        filter:
          "drop-shadow(0 0 8px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.7)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.5))",
        yoyo: true,
        repeat: 1,
        duration: 0.7,
        ease: "sine.inOut",
      },
      "-=0.2"
    )
    .to(
      loader,
      {
        opacity: 0,
        duration: 0.5,
        ease: "power1.in",
        onComplete: () => {
          loader.style.display = "none";
        },
      },
      "+=0.3"
    )
    .to(
      chatContainer,
      {
        opacity: 1,
        visibility: "visible",
        duration: 0.5,
        ease: "power1.out",
        onComplete: () => {
          if (chatbotUserInput) chatbotUserInput.focus();
        },
      },
      "-=0.3"
    );

  function addMessageToChatUI(text, type) {
    if (!chatbotMessagesContainer) return;
    const messageDiv = document.createElement("div");
    messageDiv.classList.add(
      "message",
      type === "user" ? "user-message" : "bot-message"
    );
    const p = document.createElement("p");
    p.textContent = text;
    messageDiv.appendChild(p);
    chatbotMessagesContainer.appendChild(messageDiv);

    // A more gentle scroll after adding a new message
    setTimeout(() => scrollToBottom(), 50);
  }

  async function handleSendMessage() {
    const userText = chatbotUserInput.value.trim();
    if (!userText) return;

    addMessageToChatUI(userText, "user");
    chatbotUserInput.value = "";
    chatbotSendButton.disabled = true;

    addMessageToChatUI("QBrain is thinking...", "bot");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: userText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const lastMessage = chatbotMessagesContainer.lastChild;
      if (lastMessage) {
        chatbotMessagesContainer.removeChild(lastMessage);
      }

      addMessageToChatUI(data.answer, "bot");
    } catch (error) {
      console.error("Error fetching from AI backend:", error);
      const lastMessage = chatbotMessagesContainer.lastChild;
      if (lastMessage) {
        chatbotMessagesContainer.removeChild(lastMessage);
      }
      addMessageToChatUI(
        "Sorry, I couldn't connect to the AI. Please try again later.",
        "bot"
      );
    } finally {
      chatbotSendButton.disabled = false;
      chatbotUserInput.focus();
    }
  }

  if (chatbotSendButton && chatbotUserInput) {
    chatbotSendButton.addEventListener("click", handleSendMessage);

    chatbotUserInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });

    // ---- THIS IS THE FIX FOR THE MOBILE KEYBOARD ----
    chatbotUserInput.addEventListener("focus", () => {
      // When the user focuses the input, the keyboard appears and resizes the viewport.
      // We wait a tiny moment for the resize to complete, then scroll to the bottom
      // to ensure the latest messages are visible above the keyboard.
      setTimeout(() => {
        scrollToBottom();
      }, 300); // 300ms is a safe delay for most keyboard animations.
    });
    // ---- END OF FIX ----
  }

  if (closeChatbotButton) {
    closeChatbotButton.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});
