// chat-entry-script.js (Definitive Layout Fix)

document.addEventListener("DOMContentLoaded", () => {
  // Element selectors...
  const loader = document.getElementById("chat-entry-loader");
  const chatContainer = document.getElementById("chatbot-fullscreen-container");
  const chatbotHeader = document.getElementById("chatbot-header");
  const chatbotMessagesContainer = document.getElementById("chatbot-messages");
  const chatbotInputArea = document.getElementById("chatbot-input-area");
  const chatbotMainContent = document.getElementById("chatbot-main-content");
  const chatbotUserInput = document.getElementById("chatbot-user-input");
  const chatbotSendButton = document.getElementById("chatbot-send-btn");
  const closeChatbotButton = document.getElementById("close-chatbot-btn");

  const API_URL = "https://xayed7x-qbrain-ai-backend.hf.space/api/chat";

  // ---- NEW: DYNAMIC LAYOUT ADJUSTMENT FUNCTION ----
  function adjustLayout() {
    if (
      !chatbotHeader ||
      !chatbotInputArea ||
      !chatbotMessagesContainer ||
      !chatbotMainContent
    )
      return;

    // Get the height of the fixed header and input areas
    const headerHeight = chatbotHeader.offsetHeight;
    const inputAreaHeight = chatbotInputArea.offsetHeight;

    // Set the height of the main content wrapper to fill the screen
    chatbotMainContent.style.height = "100vh"; // Use 100vh for the wrapper

    // Set padding at the top and bottom of the message container to avoid the fixed elements
    chatbotMessagesContainer.style.paddingTop = `${headerHeight + 20}px`; // 20px for extra space
    chatbotMessagesContainer.style.paddingBottom = `${inputAreaHeight + 20}px`;

    // Make the header and input area truly fixed by taking them out of the main wrapper in the CSS
    // The main-content div itself doesn't need height adjustment, but its content (messages) does
  }

  // ---- NEW: Alternative Layout Function for perfect scroll ----
  function adjustChatView() {
    if (!chatbotHeader || !chatbotInputArea || !chatbotMessagesContainer)
      return;

    const headerHeight = chatbotHeader.getBoundingClientRect().height;
    const inputAreaHeight = chatbotInputArea.getBoundingClientRect().height;
    const totalScreenHeight = window.innerHeight;

    // Calculate the available height for the messages area
    const messagesHeight = totalScreenHeight - headerHeight - inputAreaHeight;

    // We set padding on the *main content wrapper* and let messages scroll within it
    if (chatbotMainContent) {
      chatbotMainContent.style.paddingTop = `${headerHeight}px`;
      chatbotMainContent.style.paddingBottom = `${inputAreaHeight}px`;
      chatbotMainContent.style.height = "100vh";
      chatbotMainContent.style.boxSizing = "border-box";
    }

    // The messages div itself will now scroll correctly within this padded container
    chatbotMessagesContainer.style.height = "100%";
  }

  // We need to run this on load and on resize
  window.addEventListener("resize", adjustChatView);

  function scrollToBottom() {
    if (chatbotMessagesContainer) {
      chatbotMessagesContainer.scrollTop =
        chatbotMessagesContainer.scrollHeight;
    }
  }

  // GSAP animation... (no changes needed here, just ensure it targets the right elements)
  const tl = gsap.timeline();
  // ... (rest of GSAP code remains the same)
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
          adjustChatView(); // Adjust layout right when chat becomes visible
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
    chatbotUserInput.addEventListener("focus", () => {
      setTimeout(() => scrollToBottom(), 300);
    });
  }

  if (closeChatbotButton) {
    closeChatbotButton.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});
