export default async function handler(req, res) {
  const yaml = require("js-yaml");
  const axios = require("axios");
  const dataset = req.query.dataset;

  try {
    const apiList = await axios.get("http://dat-webapp:8000/list");

    const list = apiList.data;
    if (list.length) {
      list.pop();
    }

    const listNames = list.length
      ? list.map((a) => a.replace(".yaml", ""))
      : "";

    let doc = "";

    const stats = await axios.get(
      `http://dat-webapp:8000/file/${dataset}.yaml`
    );

    const statsData = stats.data;

    doc = yaml.load(statsData);

    // DATE

    let d;

    if ("timestamp" in doc) {
      const timestamp_ms = doc["timestamp"];
      const timestamp_secs = timestamp_ms * 1000;
      d = new Date(timestamp_secs).toLocaleDateString();
    } else {
      d = "n/a;";
    }

    res.send({ files: listNames, stats: doc, date: d });
  } catch (error) {
    console.log(error, "Something went sideways");
  }
}
