import { parseYamlFile } from "@/lib/helpers";

export default async function handler(req, res) {
  const yaml = require("js-yaml");
  const axios = require("axios");
  const dataset = req.query.dataset;

  const apiBase = process.env.API_URL;

  try {
    let doc = "";

    const stats = await axios.get(`${apiBase}file/${dataset}`);

    const statsData = stats.data;

    const result = parseYamlFile(statsData);

    // DATE

    let d;

    if (doc) {
      const timestamp_ms = doc["timestamp"];
      const timestamp_secs = timestamp_ms * 1000;
      d = new Date(timestamp_secs).toLocaleDateString();
    } else {
      d = "n/a;";
    }

    res.send({ date: d, report: result });
  } catch (error) {
    res.send(false);
    console.log(error, "Something went sideways");
  }
}
