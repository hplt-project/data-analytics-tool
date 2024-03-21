import axios from "axios";

export default async function handler(request, response) {
  const filename = request.query.filename;

  if (request.method !== "GET") {
    return response.status(405).end();
  }
  try {
    response.setHeader(
      "Content-Disposition",
      `attachment; filename=${filename}`
    );
    response.setHeader("Content-Type", "application/text/yaml");

    const stats = await axios.get(`http://dat-webapp:8000/file/${filename}`);

    const statsData = stats.data;

    response.json(statsData);
  } catch (error) {
    console.log(error, "this went wrong");
  }
}
