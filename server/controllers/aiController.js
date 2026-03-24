const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getAIChatResponse = async (req, res) => {
  const { message } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful dental clinic assistant. Answer questions about dental procedures, oral health, and clinic hours (9 AM - 5 PM, Mon-Fri)." },
        { role: "user", content: message }
      ],
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAIChatResponse };
