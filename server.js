require("dotenv").config();
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const { getAIReply } = require("./openai");

const app = express();
app.use(bodyParser.json());

// VERIFY INSTAGRAM WEBHOOK
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// HANDLE MESSAGES
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const messaging = changes?.value?.messages?.[0];

    const senderId = messaging?.from;
    const userMsg = messaging?.text?.body;

    if (senderId && userMsg) {
      const reply = await getAIReply(userMsg);

      await axios.post(
        `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: senderId,
          text: { body: reply },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAGE_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log("✅ Server running on port 3000");
});
