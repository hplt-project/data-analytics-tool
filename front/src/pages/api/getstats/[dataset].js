import { parseYamlFile } from "@/lib/helpers";

export default async function handler(req, res) {
  const axios = require("axios");
  const dataset = req.query.dataset;

  const apiBase = process.env.API_URL;

  try {
    const stats = await axios.get(`${apiBase}file/${dataset}`);

    const statsData = stats.data;

    const result = parseYamlFile(statsData);

    res.send({ date: d, report: result });
  } catch (error) {
    res.send(false);
    console.log(error, "Something went sideways");
  }
}
