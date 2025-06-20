const axios = require("axios");
require("dotenv").config();

async function getAIReply(userInput) {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userInput }],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  return response.data.choices[0].message.content.trim();
}

module.exports = { getAIReply };
