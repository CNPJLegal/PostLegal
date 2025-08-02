
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

module.exports = async (req, res) => {
  const body = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: body.prompt }],
      temperature: 0.8
    });

    const result = completion.choices?.[0]?.message?.content || "";
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ error: "Erro ao chamar OpenAI", detail: err.message });
  }
};
