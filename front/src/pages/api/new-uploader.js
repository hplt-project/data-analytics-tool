import axios from "axios";

export const config = {
    api: {
        bodyParser: false,
    }
}

export default async function handler(req, res) {
    const { method } = req;

    if (method === 'POST') {
        const { headers: { cookie, ...rest }, method } = req;

        try {
            const response = await axios({
                url: "http://dat-webapp:8000/upload",
                method: 'post',
                data: req,
                headers: {
                    'content-type': rest['content-type'],
                    'content-length': rest['content-length']
                }
            });

            return res.status(200).json(response.data);
        } catch (error) {
            const { response } = error;
            return res.status(response?.status || 500).json({
                error: response?.data || 'Upload failed'
            });
        }
    }

    return res.status(405).end(`Method ${method} Not Allowed`);
}