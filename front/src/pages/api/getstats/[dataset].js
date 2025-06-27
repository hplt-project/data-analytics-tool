export default async function handler(req, res) {
  const yaml = require("js-yaml");
  const axios = require("axios");
  const dataset = req.query.dataset;

  try {
    let doc = "";

    const stats = await axios.get(`http://dat-webapp:8000/file/${dataset}`);

    const statsData = stats.data;

    doc = yaml.load(statsData);

    const entries = Object.entries(doc);

    const result = {};

    for (const [key, value] of entries) {
      if (typeof value === 'string') {
        try {
          result[key] = JSON.parse(value);
        } catch (error) {
          result[key] = value; // Keep original string if parsing fails
        }
      } else {
        result[key] = value;
      }
    }

    // DATE

    let d;

    if (doc) {
      const timestamp_ms = doc["timestamp"];
      const timestamp_secs = timestamp_ms * 1000;
      d = new Date(timestamp_secs).toLocaleDateString();
    } else {
      d = "n/a;";
    }

    res.send({ stats: doc, date: d, report: result });
  } catch (error) {
    res.send(false);
    console.log(error, "Something went sideways");
  }
}
