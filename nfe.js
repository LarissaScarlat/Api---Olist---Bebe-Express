import express from "express";
import axios from "axios";
import fs from "fs";

const router = express.Router();

function loadTokens() {
  try {
    return JSON.parse(fs.readFileSync("tokens.json", "utf8"));
  } catch {
    return null;
  }
}

router.get("/:idNota", async (req, res) => {
  try {
    const idNota = req.params.idNota;

    if (!idNota) {
      return res.status(400).json({ error: "Você deve informar o ID da nota fiscal." });
    }

    const tokens = loadTokens();
    if (!tokens?.access_token) {
      return res.status(401).json({ error: "Sem token. Autentique novamente." });
    }

    const url = `https://api.tiny.com.br/public-api/v3/notas/${idNota}`;


    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: "application/json"
      },
      timeout: 15000
    });

    return res.json({
      message: "Nota fiscal encontrada com sucesso!",
      data: response.data
    });

  } catch (error) {
    console.error("❌ Erro ao buscar NFe");

    return res.status(error.response?.status || 500).json({
      error: "Erro ao consultar nota fiscal",
      details: error.response?.data || error.message
    });
  }
});

export default router;
