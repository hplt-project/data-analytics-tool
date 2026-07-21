export default async function handler(request, response) {
  const filename = request.query.filename;

  const apiBase = process.env.API_URL;

  if (request.method !== "GET") {
    return response.status(405).end();
  }
  try {
    response.setHeader(
      "Content-Disposition",
      `attachment; filename=${filename}`
    );
    response.setHeader("Content-Type", "application/text/yaml");

    const stats = await fetch(`${apiBase}file/${filename}`);
    if (!stats.ok) {
      throw new Error("Failed to download file");
    }

    const statsData = await stats.text();

    response.json(statsData);
  } catch (error) {
    console.log(error, "this went wrong downloading the file");
  }
}
