const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY || "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",
  defaultHeaders: {
    "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
    "X-Title": "Dental Dashboard Assistant"
  }
});

const DENTAL_SYSTEM_PROMPT = `You are a Dental Clinic AI Assistant. Your ONLY purpose is to answer questions strictly related to dental and oral health topics, including:
- Dental procedures (cleanings, fillings, extractions, braces, implants, root canals, whitening, veneers, dentures, etc.)
- Oral hygiene tips and best practices (brushing, flossing, mouthwash, diet for teeth, etc.)
- Symptoms related to teeth, gums, or jaw (toothache, sensitivity, bleeding gums, jaw pain, etc.)
- General dentistry information and terminology
- Clinic-related queries (available services, treatment options, what to expect during a visit)

STRICT NON-NEGOTIABLE RULE:
If a user asks about ANYTHING that is NOT related to dental or oral health — including but not limited to topics like weather, politics, cooking, math, technology, entertainment, or any general knowledge — you MUST respond with ONLY this exact message, nothing else:
"Only dental topic I can answer related! Try Again."

Do NOT attempt to answer, explain, hint at, or engage with any off-topic question under any circumstance. No exceptions.`;

const getAIChatResponse = async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message is required.' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'system', content: DENTAL_SYSTEM_PROMPT },
        { role: 'user', content: message.trim() }
      ],
      temperature: 0.4,
      max_tokens: 500,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('[AI Controller Error]:', err.message);
    res.status(500).json({ message: 'AI service is currently unavailable. Please try again later.' });
  }
};

module.exports = { getAIChatResponse };
