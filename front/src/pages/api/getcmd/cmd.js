import { Writable } from "stream";
import formidable from "formidable";

const formidableConfig = {
  keepExtensions: true,
  maxFields: 7,
  allowEmptyFiles: false,
  multiples: false,
};

export async function POST(request) {
  return new Response("Hello, Next.js!", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

function formidablePromise(req, opts) {
  return new Promise((accept, reject) => {
    const form = formidable(opts);

    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      return accept({ fields, files });
    });
  });
}

const fileConsumer = (acc) => {
  const writable = new Writable({
    write: (chunk, _enc, next) => {
      acc.push(chunk);
      next();
    },
  });

  return writable;
};

export default async function handler(req, res) {
  const axios = require("axios");

  if (req.method !== "POST") return res.status(404).end();

  try {
    const chunks = [];

    const { fields, files } = await formidablePromise(req, {
      ...formidableConfig,
      fileWriteStreamHandler: () => fileConsumer(chunks),
    });

    const fileData = Buffer.concat(chunks);

    const attachments = {
      corpusname: fields["corpusname"][0],
      corpus: fileData,
      "corpus-format": fields["corpus-format"][0],
      "lang-format": fields["lang-format"][0],
      srclang: fields["srclang"][0],
      trglang: fields["trglang"][0],
    };

    const response = await axios.post(
      "http://dat-webapp:8000/getcmd",
      attachments,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.json(response.data);
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
