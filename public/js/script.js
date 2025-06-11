document.addEventListener("DOMContentLoaded", () => {
  // Chat setup
  const messages = document.getElementById("messages");
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  const clearChat = document.getElementById("clearChat");
  let state = JSON.parse(localStorage.getItem("chatState"));
  let conversation = [];

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

      appendMessage("assistant", "...");
      const placeholderIndex = messages.children.length - 1;
      messages.children[placeholderIndex].classList.add("loading");

      // Limit chat history
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

          messages.children[placeholderIndex].classList.remove("loading");
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
          messages.children[placeholderIndex].classList.remove("loading");
          messages.children[placeholderIndex].textContent = data.message;
          conversation.push({ role: "assistant", content: data.message });
          localStorage.setItem("chatHistory", JSON.stringify(conversation));
        }
      } catch (err) {
        messages.children[placeholderIndex].classList.remove("loading");
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
    buttons.forEach((button) => {
      const id = button.parentElement.dataset.id

      const parentLi = button.closest("li");
      const link = parentLi.querySelector("a[href^='/item/']");
      if (!link) return;

      button.addEventListener("click", () => {
        const current = getSavedIds().map(String);
        const index = current.indexOf(id).toString();

        if (index > -1) {
          console.log("zit erin")
          current.splice(index, 1);
          button.classList.remove("filled");
        } else {
          console.log("zit niet erin")
          current.push(String(id));
          button.classList.add("filled");
        }

        setSavedIds(current);
        
        if (window.location.pathname === "/saved") {
          location.reload();
        }

      })
    });
  }

  // Load saved bookmarks
  const savedIds = getSavedIds();
  buttons.forEach((button) => {
    const id = button.parentElement.dataset.id;
    if (savedIds.includes(id)) {
      button.classList.add("filled");
    }
  });
});

 
function getSavedIds() {
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('savedIds='));
  if (!cookie) return [];
 
  try {
    return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
  } catch {
    return [];
  }
}

function setSavedIds(ids) {
  const days = 30;
  const date = new Date();
  date.setTime(date.getTime() + (days*24*60*60*1000));
  const expires = "expires=" + date.toUTCString();
 
  document.cookie = `savedIds=${encodeURIComponent(JSON.stringify(ids))}; ${expires}; path=/`;
}