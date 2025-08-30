async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (!message) return;

  addMessage("You: " + escapeHtml(message), "user");
  input.value = "";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    // Wrap the bot response in proper HTML formatting
    const formattedReply = formatMindsyncReply(data.reply);
    addMessage(formattedReply, "bot");
  } catch (err) {
    addMessage("⚠️ Error connecting to server", "bot");
  }
}

// Escape user input to prevent HTML injection
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Format bot reply with HTML for proper display
function formatMindsyncReply(replyText) {
  // Here you can add your HTML structure
  return `
    <strong>Mindsync:</strong><br>
    ${replyText
      .replace(/\n\n/g, "<br><br>")  // double line breaks
      .replace(/\n/g, "<br>")        // single line breaks
      .replace(/\* (.*)/g, "• $1")   // convert bullet points
      }
  `;
}

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.innerHTML = text; // changed from textContent to innerHTML
  document.getElementById("chatbox").appendChild(div);
  document.getElementById("chatbox").scrollTop =
    document.getElementById("chatbox").scrollHeight;
}
