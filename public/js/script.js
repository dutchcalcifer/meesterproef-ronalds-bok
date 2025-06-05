document.addEventListener("DOMContentLoaded", () => {
  // --- Chat functionaliteit ---
  const messages = document.getElementById("messages");
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  let conversation = [];

  function appendMessage(role, text) {
    if (!messages) return; // als messages niet bestaat, doe niks
    const li = document.createElement("li");
    li.className = role;
    li.textContent = text;
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
  }

  if (messages) {
    // Chat geschiedenis laden
    const savedChat = localStorage.getItem("chatHistory");
    if (savedChat) {
      conversation = JSON.parse(savedChat);
      conversation.forEach((msg) => appendMessage(msg.role, msg.content));
    }

    // Form event listener voor chat
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

        appendMessage("assistant", "...");
        const placeholderIndex = messages.children.length - 1;

        if (conversation.length > 20) {
          conversation = conversation.slice(-20);
        }

        try {
          const res = await fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversation }),
          });
          const data = await res.json();

          if (data.final) {
            window.location.href = `/?${data.query}`;
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

    // Chat geschiedenis wissen
    const clearChat = document.getElementById("clearChat");
    if (clearChat) {
      clearChat.addEventListener("click", () => {
        localStorage.removeItem("chatHistory");  // alleen chat verwijderen
        location.reload();
      });
    }
  }

  // --- Bookmark toggle functionaliteit ---
  const buttons = document.querySelectorAll(".results li button");
  if (buttons.length) {
    let saved = JSON.parse(localStorage.getItem("savedItems")) || [];

    buttons.forEach((button) => {
      const parentLi = button.closest("li");
      const link = parentLi.querySelector("a[href^='/item/']");
      if (!link) return;

      const itemId = link.href.split("/").pop();

      // Vul de button als opgeslagen
      if (saved.includes(itemId)) {
        button.classList.add("filled");
      }

      button.addEventListener("click", () => {
        if (saved.includes(itemId)) {
          saved = saved.filter((id) => id !== itemId);
          button.classList.remove("filled");
          // Verwijder ook direct de kaart op /saved pagina
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

  // --- Link naar opgeslagen kaarten ---
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
