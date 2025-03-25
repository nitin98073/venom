const venom = require("venom-bot");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let client;

// Start WhatsApp session
venom
  .create({
    session: "whatsapp-bot",
    multidevice: true,
  })
  .then((bot) => {
    client = bot;
    console.log("WhatsApp Bot Started");

    client.onMessage((message) => {
      if (!message.isGroupMsg) {
        handleMessage(message);
      }
    });
  })
  .catch((err) => console.log(err));

// Auto-reply logic
function handleMessage(message) {
  let text = message.body.toLowerCase().trim();
  let reply = "Sorry, I didn't understand that. Type 'help' for assistance.";

  const replies = {
    hi: "Hello! How can I help you?",
    help: "I am a chatbot. You can ask me about services, pricing, or support.",
    bye: "Goodbye! Have a great day! 😊",
  };

  if (replies[text]) {
    reply = replies[text];
  }

  client.sendText(message.from, reply);
}

// API endpoint to send messages
app.post("/send", async (req, res) => {
  const { number, message } = req.body;

  if (!client) {
    return res.status(500).json({ error: "WhatsApp session not initialized" });
  }

  try {
    await client.sendText(`${number}@c.us`, message);
    res.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
