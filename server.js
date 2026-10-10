
const express = require("express");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

app.get("/", (req, res) => {
  res.status(200).send("Bot Dale Play activo");
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  try {
    const messages =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages;

    if (!messages) return;

    for (const message of messages) {
      if (message.type !== "text") continue;

      const from = message.from;
      const text = message.text.body.trim();

      if (text.toUpperCase() === "QUIERO HABLAR CON EL VENDEDOR") {
        console.log("Cliente solicita vendedor:", from);
        continue;
      }

      let reply =
        "¡Hola! 👋 Bienvenido a Dale Play 🎮\n\n" +
        "Escribe una opción:\n" +
        "1. Catálogo y precios\n" +
        "2. Garantía\n" +
        "3. Cómo comprar\n" +
        "4. Horarios de instalación\n\n" +
        "Para solicitar atención del vendedor, escribe:\n" +
        "QUIERO HABLAR CON EL VENDEDOR";

      const lower = text.toLowerCase();

      if (lower === "1" || lower.includes("catálogo") ||
          lower.includes("catalogo") || lower.includes("precio")) {
        reply = "🎮 ¡Tenemos juegos para ti! Estamos preparando el catálogo automático de Dale Play. Consulta los precios con el vendedor mientras lo configuramos.";
      } else if (lower === "2" || lower.includes("garantía") ||
                 lower.includes("garantia")) {
        reply = "🛡️ Para conocer las condiciones de garantía de tu juego, consulta al vendedor de Dale Play antes de comprar.";
      } else if (lower === "3" || lower.includes("comprar") ||
                 lower.includes("compra")) {
        reply = "🛒 ¡Gracias por elegir Dale Play! Indícanos qué juego te interesa y el vendedor te ayudará con el proceso de compra.";
      } else if (lower === "4" || lower.includes("horario") ||
                 lower.includes("instalación") ||
                 lower.includes("instalacion")) {
        reply = "🕒 Consulta con el vendedor los horarios disponibles para instalación.";
      }

      if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
        console.log("Faltan credenciales de WhatsApp.");
        continue;
      }

      await fetch(
        `https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: from,
            type: "text",
            text: { body: reply }
          })
        }
      );
    }
  } catch (error) {
    console.error("Error procesando mensaje:", error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot Dale Play escuchando en puerto ${PORT}`);
});
