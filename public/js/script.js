(() => {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("input");
  const messages = document.getElementById("messages");
  let conversation = [];

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userText = input.value.trim();
    if (!userText) return;

    appendMessage("user", userText);
    conversation.push({ role: "user", content: userText });
    input.value = "";

    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation }),
    });
    const data = await res.json();

    if (data.final) {
      const params = new URLSearchParams({ q: data.query }).toString();
      window.location.href = `/?${params}`;
    } else {
      appendMessage("assistant", data.message);
      conversation.push({ role: "assistant", content: data.message });
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
