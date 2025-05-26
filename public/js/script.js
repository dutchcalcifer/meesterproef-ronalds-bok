(() => {
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  const messages = document.getElementById("messages");
  let conversation = [];

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userText = input.value.trim();
    if (!userText) return;

    appendMessage("user", userText);
    conversation.push({ role: "user", content: userText });
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
        const params = new URLSearchParams({ q: data.query }).toString();
        window.location.href = `/?${params}`;
      } else {
        messages.children[placeholderIndex].textContent = data.message;
        conversation.push({ role: "assistant", content: data.message });
      }
    } catch (err) {
      messages.children[placeholderIndex].textContent =
        "Er ging iets mis. Probeer opnieuw.";
    }
  });

  function appendMessage(role, text) {
    const li = document.createElement("li");
    li.className = role;
    li.textContent = text;
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
  }
})();
