const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const queryCounter = document.getElementById("stat-queries");

let totalQueries = 0;
const BACKEND_URL = "http://127.0.0.1:8000/api/ai/chat";

function appendMessage(sender, text, type) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msg", type);
  msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(msgDiv);

  chatBox.scrollTop = chatBox.scrollHeight;
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const promptText = userInput.value.trim();
  if (!promptText) return;

  appendMessage("You", promptText, "user");
  userInput.value = "";

  const thinkingDiv = document.createElement("div");
  thinkingDiv.classList.add("msg", "system");
  thinkingDiv.id = "thinking-indicator";
  thinkingDiv.innerHTML = `<em>Agent is computing response on your i5 CPU...</em>`;
  chatBox.appendChild(thinkingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: promptText }),
    });

    document.getElementById("thinking-indicator").remove();

    if (!response.ok) {
      throw new Error(`Server returned code: ${response.status}`);
    }

    const data = await response.json();

    // 4. Render the local AI response text
    appendMessage("AI Agent", data.response, "bot");

    totalQueries++;
    queryCounter.textContent = totalQueries;
  } catch (error) {
    if (document.getElementById("thinking-indicator")) {
      document.getElementById("thinking-indicator").remove();
    }
    appendMessage(
      "System Error",
      "Failed to establish loopback connection with your backend pipeline. Verify that your Uvicorn server terminal is active.",
      "system",
    );
    console.error("API Pipeline Crash:", error);
  }
});
