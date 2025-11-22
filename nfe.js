import express from "express";
import axios from "axios";
import fs from "fs";

const router = express.Router();

function loadTokens() {
  try {
    const raw = fs.readFileSync("tokens.json", "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

router.get("/:idNota", async (req, res) => {
  try {
    const idNota = req.params.idNota;

    if (!idNota) {
      return res.status(400).json({ error: "Você deve informar o ID da nota fiscal na URL." });
    }

    const tokens = loadTokens();
    if (!tokens || !tokens.access_token) {
      return res.status(401).json({ error: "Access token não encontrado. Faça a autenticação novamente." });
    }

    const url = `https://api.tiny.com.br/notas/${idNota}`;

    //const url = `https://www.bling.com.br/Api/v3/nfe/${idNotaFiscal}`;

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
    console.error("❌ Erro ao buscar nota fiscal:");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      console.error("Data:", error.response.data);
    } else {
      console.error(error.message);
    }

    const details = error.response?.data || error.message;
    const statusCode = error.response?.status || 500;
    return res.status(statusCode).json({
      error: "Erro ao consultar nota fiscal",
      details
    });
  }
});

export default router;