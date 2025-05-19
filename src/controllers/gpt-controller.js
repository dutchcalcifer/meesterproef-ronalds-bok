import openai from "../../server.js";

export async function gpt(conversation) {
  const systemPrompt = `
Je bent een chatbot voor de CMD Base website.
Je helpt gebruikers heel concreet bij het vinden van CMD-termen (Communicatie en Multimedia Design).
Als je denkt een zoekterm te hebben, vraag je kort: “Bedoel je '<term>'?”
Wacht op bevestiging (‘ja’).
Na bevestiging antwoord je **alleen** met:
FINAL_QUERY: <term>
en niets anders.`;

  const messages = [
    { role: "system", content: systemPrompt.trim() },
    ...conversation,
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.0,
  });

  const text = response.choices[0].message.content.trim();

  if (text.startsWith("FINAL_QUERY:")) {
    const query = text.replace(/^FINAL_QUERY:\s*/i, "");
    return { type: "final_query", query };
  }

  return { type: "message", message: text };
}
