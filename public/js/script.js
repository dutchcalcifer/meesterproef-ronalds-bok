(() => {
  // Get DOM elements
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  const messages = document.getElementById("messages");
  let conversation = [];

  // Load chat history from localStorage
  const savedChat = localStorage.getItem("chatHistory");
  if (savedChat) {
    conversation = JSON.parse(savedChat);
    conversation.forEach((msg) => appendMessage(msg.role, msg.content));
  }

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userText = input.value.trim();
    if (!userText) return;

    // Show user message
    appendMessage("user", userText);
    conversation.push({ role: "user", content: userText });
    localStorage.setItem("chatHistory", JSON.stringify(conversation));

    // Clear and focus input
    input.value = "";
    input.focus();

    // Add placeholder for assistant reply
    appendMessage("assistant", "...");
    const placeholderIndex = messages.children.length - 1;

    // Keep only the last 20 messages
    if (conversation.length > 20) {
      conversation = conversation.slice(-20);
    }

    try {
      // Send conversation to server
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation }),
      });
      const data = await res.json();

      // If final query, redirect with query params
      if (data.final) {
        // Show final acknowledgement before redirect
        messages.children[placeholderIndex].textContent =
          "ik ga voor je aan de slag";
        conversation.push({
          role: "assistant",
          content: "ik ga voor je aan de slag",
        });
        localStorage.setItem("chatHistory", JSON.stringify(conversation));

        // Redirect with query params
        setTimeout(() => {
          window.location.href = `/?${data.query}`;
        }, 500); // small delay so user sees the message
      } else {
        // Replace placeholder with assistant message
        messages.children[placeholderIndex].textContent = data.message;
        conversation.push({ role: "assistant", content: data.message });
        localStorage.setItem("chatHistory", JSON.stringify(conversation));
      }
    } catch (err) {
      // Show error message on failure
      messages.children[placeholderIndex].textContent =
        "Er ging iets mis. Probeer opnieuw.";
    }
  });

  // Helper to append a message to the list
  function appendMessage(role, text) {
    const li = document.createElement("li");
    li.className = role;
    li.textContent = text;
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
  }
})();

(() => {
  document.getElementById("clearChat").addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });
})();

(() => {
  const buttons = document.querySelectorAll(".results li button");
  for (const button of buttons) {
    button.addEventListener("click", function () {
      this.classList.toggle("filled");
    });
  }
})();
