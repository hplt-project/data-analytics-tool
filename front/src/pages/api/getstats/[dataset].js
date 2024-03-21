export default async function handler(req, res) {
  const yaml = require("js-yaml");
  const axios = require("axios");
  const dataset = req.query.dataset;

  try {
    let doc = "";

    const stats = await axios.get(`http://dat-webapp:8000/file/${dataset}`);

    const statsData = stats.data;

    doc = yaml.load(statsData);

    // DATE

    let d;

    if (doc) {
      const timestamp_ms = doc["timestamp"];
      const timestamp_secs = timestamp_ms * 1000;
      d = new Date(timestamp_secs).toLocaleDateString();
    } else {
      d = "n/a;";
    }

    res.send({ stats: doc, date: d });
  } catch (error) {
    console.log(error, "Something went sideways");
  }
}
