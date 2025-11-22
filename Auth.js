import express from "express";
import axios from "axios";
import 'dotenv/config';
import qs from "querystring"; // Para montar o corpo x-www-form-urlencoded
import crypto from "crypto";  // Para gerar o parâmetro 'state' aleatório
import fs from "fs"; // <-- Adicione isso junto às outras imports
import notaRoute from "./Buscar.js";


const app = express();
const PORT = process.env.PORT || 3000;

// ========================
// 1️⃣ ROTA DE AUTORIZAÇÃO
// ========================
app.get("/", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");

  const authUrl = `${process.env.AUTH_URL}?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&state=${state}`;



  console.log("🔗 Redirecionando para:", authUrl);
  res.redirect(authUrl);
});

// ========================
// 2️⃣ CALLBACK DO BLING
// ========================
app.get("/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send("Erro: código de autorização não recebido.");
  }


  console.log("✅ Código recebido do Bling:", code);

  try {
    // Monta o Basic Auth: client_id:client_secret codificado em Base64
    const credentials = Buffer.from(
      `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
    ).toString("base64");

    // Monta o corpo da requisição
    const data = qs.stringify({
      grant_type: "authorization_code",
      code: code
    });

    // Faz o POST para o endpoint de token
    const response = await axios.post(
      process.env.TOKEN_URL,
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept":"aplication/json",
          "Authorization": `Basic ${credentials}`
        }
      }
    );

    const tokenData = response.data;

    console.log("🎟️ Tokens recebidos do Bling:");
    console.log(tokenData);

    res.json({
      message: "Autorização concluída com sucesso!",
      tokens: tokenData
    });

    // Salva no arquivo tokens.json
  fs.writeFileSync("tokens.json", JSON.stringify(tokenData, null, 2), "utf-8");

  console.log("💾 Tokens salvos com sucesso no arquivo tokens.json!");

  } catch (error) {
    console.error("❌ Erro ao obter tokens:", error.response?.data || error.message);
    res.status(500).send("Erro ao obter tokens de acesso.");
  }
});

app.use("/nfe", notaRoute);

// ========================
// INICIA SERVIDOR
// ========================
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando no link  http://localhost:${PORT}`);
});