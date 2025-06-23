// chat-entry-script.js (Simplified for CSS Grid Layout)

document.addEventListener("DOMContentLoaded", () => {
  // Element selectors...
  const loader = document.getElementById("chat-entry-loader");
  const chatContainer = document.getElementById("chatbot-fullscreen-container");
  const chatbotUserInput = document.getElementById("chatbot-user-input");
  const chatbotSendButton = document.getElementById("chatbot-send-btn");
  const chatbotMessagesContainer = document.getElementById("chatbot-messages");
  const closeChatbotButton = document.getElementById("close-chatbot-btn");

  const API_URL = "https://xayed7x-qbrain-ai-backend.hf.space/api/chat";

  // Reusable function to scroll the chat to the bottom
  function scrollToBottom() {
    if (chatbotMessagesContainer) {
      chatbotMessagesContainer.scrollTop =
        chatbotMessagesContainer.scrollHeight;
    }
  }

  // GSAP animation...
  const tl = gsap.timeline();
  // ... (GSAP code remains exactly the same)
  tl.to(loader, { duration: 0.01 })
    .fromTo(
      document.getElementById("loader-logo"),
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
      document.getElementById("loader-title"),
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
      document.getElementById("loader-subtitle"),
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
      document.getElementById("loader-logo"),
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
          // No need to adjust layout with JS anymore!
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
    // Use a small timeout to ensure the DOM has updated before scrolling
    setTimeout(scrollToBottom, 50);
  }

  async function handleSendMessage() {
    const userText = chatbotUserInput.value.trim();
    if (!userText) return;
    addMessageToChatUI(userText, "user");
    chatbotUserInput.value = "";
    chatbotSendButton.disabled = true;
    addMessageToChatUI("Baseera is thinking...", "bot");
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText }),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const lastMessage = chatbotMessagesContainer.lastChild;
      if (lastMessage) chatbotMessagesContainer.removeChild(lastMessage);
      addMessageToChatUI(data.answer, "bot");
    } catch (error) {
      console.error("Error fetching from AI backend:", error);
      const lastMessage = chatbotMessagesContainer.lastChild;
      if (lastMessage) chatbotMessagesContainer.removeChild(lastMessage);
      addMessageToChatUI(
        "Sorry, I couldn't connect to my knowledge base. Please try again later.",
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
    // The 'focus' listener is no longer needed as the layout is handled by CSS
  }

  if (closeChatbotButton) {
    closeChatbotButton.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});
