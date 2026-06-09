const OpenAI = require('openai');
const db = require('../config/db');

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY || "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",
  defaultHeaders: {
    "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
    "X-Title": "Dental Dashboard Assistant"
  }
});

const getAIChatResponse = async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message is required.' });
  }

  try {
   
    const servicesResult = await db.query('SELECT name, description, price, duration_minutes FROM services');
    const services = servicesResult.rows;

   
    const servicesInfo = services.map(s => 
      `- **${s.name}**: ${s.description || 'No description available'} • Price: ₱${s.price} • Duration: ${s.duration_minutes} minutes`
    ).join('\n');

    const DENTAL_SYSTEM_PROMPT = `You are a Dental Clinic AI Assistant. Your ONLY purpose is to answer questions strictly related to the dental clinic's services, pricing, and information. Here are the clinic's available services:

${servicesInfo}

RESPONSE FORMATTING GUIDELINES (MUST FOLLOW):
Always format your responses in a CLEAN, MODERN, ORGANIZED way using:
1. **Headings** with **bold** markdown (e.g., **Topic Title**)
2. **Bullet points** (- ) for lists
3. **Numbered lists** (1., 2., 3.) for step-by-step instructions
4. **Short paragraphs** for readability
5. **Emphasis** with **bold** for important terms

STRICT NON-NEGOTIABLE RULES:
1. If a user asks about ANYTHING that is NOT related to the clinic's dental services (listed above), pricing, or general clinic information — you MUST respond with ONLY this exact message, nothing else: "Only dental clinic service information I can answer! Try Again."
2. Only use the service information provided above. Do not invent or assume any services not listed.
3. Keep responses focused on the clinic's services, pricing, and what's available.`;

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
