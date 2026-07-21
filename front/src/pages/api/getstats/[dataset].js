import { parseYamlFile } from "@/lib/helpers";

export default async function handler(req, res) {
  const dataset = req.query.dataset;

  const apiBase = process.env.API_URL;

  try {
    const stats = await fetch(`${apiBase}file/${dataset}`);
    if (!stats.ok) {
      throw new Error("Failed to fetch dataset");
    }

    const statsData = await stats.text();

    const result = parseYamlFile(statsData);

    res.send({ date: result.date, report: result.report });
  } catch (error) {
    res.send(false);
    console.log(error, "Something went sideways");
  }
}
