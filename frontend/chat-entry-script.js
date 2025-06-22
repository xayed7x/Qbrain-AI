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

  // --- MODIFICATION START ---
  // Define the API endpoint URL. This makes it easy to change if you deploy your backend.
  const API_URL = "http://127.0.0.1:8000/api/chat";
  // --- MODIFICATION END ---


  if (!loader || !chatContainer) {
    console.error("QBrain AI Chat: Loader or chat container not found.");
    if (chatContainer) chatContainer.style.opacity = 1; // Failsafe: show chat if loader fails
    return;
  }

  // Direct entry animation for chat.html (No changes here)
  const tl = gsap.timeline();
  tl.to(loader, { duration: 0.01 })
    .fromTo(
      logo,
      { opacity: 0, scale: 0.8, y: 20, visibility: "hidden" },
      { opacity: 1, scale: 1, y: 0, visibility: "visible", duration: 0.6, ease: "back.out(1.7)" }
    )
    .fromTo(
      title,
      { opacity: 0, y: 10, visibility: "hidden" },
      { opacity: 1, y: 0, visibility: "visible", duration: 0.5, ease: "power2.out" },
      "-=0.4"
    )
    .fromTo(
      subtitle,
      { opacity: 0, y: 10, visibility: "hidden" },
      { opacity: 1, y: 0, visibility: "visible", duration: 0.4, ease: "power2.out" },
      "-=0.3"
    )
    .to(
      logo,
      {
        scale: 1.05,
        filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.7)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.5))",
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

  // Basic Chatbot Send Functionality (No changes here)
  function addMessageToChatUI(text, type) {
    if (!chatbotMessagesContainer) return;
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", type === "user" ? "user-message" : "bot-message");
    const p = document.createElement("p");
    p.innerHTML = text.replace(/\n/g, "<br>");
    messageDiv.appendChild(p);
    chatbotMessagesContainer.appendChild(messageDiv);
    chatbotMessagesContainer.scrollTop = chatbotMessagesContainer.scrollHeight;
  }

  // --- MODIFICATION START: Updated send logic ---
  async function handleSendMessage() {
    const userText = chatbotUserInput.value.trim();
    if (!userText) return;

    // 1. Display the user's message immediately
    addMessageToChatUI(userText, "user");
    chatbotUserInput.value = "";
    chatbotSendButton.disabled = true; // Disable button to prevent multiple sends

    // 2. Display a "thinking" message for better UX
    addMessageToChatUI("QBrain is thinking...", "bot");

    try {
      // 3. Send the user's message to the backend API
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: userText }), // Match the Pydantic model
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json(); // Get the response JSON { "answer": "..." }

      // 4. Remove the "thinking" message and add the real AI response
      // Find the last message (which is our "thinking" message) and remove it.
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
      addMessageToChatUI("Sorry, I couldn't connect to the AI. Please try again later.", "bot");
    } finally {
        chatbotSendButton.disabled = false; // Re-enable the send button
        chatbotUserInput.focus();
    }
  }
  
  if (chatbotSendButton && chatbotUserInput) {
    // We replace the original event listener with one that calls our new async function
    chatbotSendButton.addEventListener("click", handleSendMessage);

    chatbotUserInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }
  // --- MODIFICATION END ---


  if (closeChatbotButton) {
    closeChatbotButton.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});