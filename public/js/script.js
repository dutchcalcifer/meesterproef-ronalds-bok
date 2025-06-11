document.addEventListener("DOMContentLoaded", () => {
  // Chat setup
  const messages = document.getElementById("messages");
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  const clearChat = document.getElementById("clearChat");
  let state = JSON.parse(localStorage.getItem("chatState"));
  let conversation = [];

  // Chat state
  if (state) {
    // close chat
    console.log("chatState is true");
  } else {
    // leave open
    console.log("chatState is false");
  }

  function appendMessage(role, text) {
    if (!messages) return;
    const li = document.createElement("li");
    li.className = role;
    li.textContent = text;
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
  }

  // Laad chat geschiedenis
  const savedChat = localStorage.getItem("chatHistory");
  if (savedChat) {
    conversation = JSON.parse(savedChat);
    conversation.forEach((msg) => appendMessage(msg.role, msg.content));
  }

  // Form submit handler - maar 1x event listener!
  if (form && input) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const userText = input.value.trim();
      if (!userText) return;

      appendMessage("user", userText);
      conversation.push({ role: "user", content: userText });
      localStorage.setItem("chatHistory", JSON.stringify(conversation));

      input.value = "";
      input.focus();

      appendMessage("loading", "...");
      const placeholderIndex = messages.children.length - 1;

      if (conversation.length > 20) {
        conversation = conversation.slice(-20);
      }

      try {
        localStorage.setItem("chatState", JSON.stringify(false));

        const res = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversation }),
        });
        const data = await res.json();

        if (data.final) {
          localStorage.setItem("chatState", JSON.stringify(true));

          messages.children[placeholderIndex].textContent =
            "ik ga voor je aan de slag, ik heb de volgende resultaten gevonden:";
          conversation.push({
            role: "assistant",
            content:
              "ik ga voor je aan de slag, ik heb de volgende resultaten gevonden:",
          });
          localStorage.setItem("chatHistory", JSON.stringify(conversation));

          setTimeout(() => {
            window.location.href = `/?${data.query}`;
          }, 500);
        } else {
          messages.children[placeholderIndex].textContent = data.message;
          conversation.push({ role: "assistant", content: data.message });
          localStorage.setItem("chatHistory", JSON.stringify(conversation));
        }
      } catch (err) {
        messages.children[placeholderIndex].textContent =
          "Er ging iets mis. Probeer opnieuw.";
      }
    });
  }

  // Chat clear button
  if (clearChat) {
    clearChat.addEventListener("click", () => {
      localStorage.removeItem("chatHistory");
      location.reload();
    });
  }

  // Bookmark toggle
  const buttons = document.querySelectorAll(".results li button");
  if (buttons.length) {
    let saved = JSON.parse(localStorage.getItem("savedItems")) || [];

    buttons.forEach((button) => {
      const parentLi = button.closest("li");
      const link = parentLi.querySelector("a[href^='/item/']");
      if (!link) return;

      const itemId = link.href.split("/").pop();

      if (saved.includes(itemId)) {
        button.classList.add("filled");
      }

      button.addEventListener("click", () => {
        if (saved.includes(itemId)) {
          saved = saved.filter((id) => id !== itemId);
          button.classList.remove("filled");
          if (window.location.pathname === "/saved") {
            parentLi.remove();
          }
        } else {
          saved.push(itemId);
          button.classList.add("filled");
        }
        localStorage.setItem("savedItems", JSON.stringify(saved));
      });
    });
  }

  // Link naar saved pagina
  const savedLink = document.getElementById("go-to-saved");
  if (savedLink) {
    savedLink.addEventListener("click", (e) => {
      e.preventDefault();
      const saved = JSON.parse(localStorage.getItem("savedItems")) || [];
      if (saved.length > 0) {
        const ids = saved.join(",");
        window.location.href = `/saved?ids=${ids}`;
      } else {
        alert("Je hebt nog niks opgeslagen.");
      }
    });
  }
});
