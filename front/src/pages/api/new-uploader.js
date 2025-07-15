import axios from "axios";

export const config = {
    api: {
        bodyParser: false,
    }
}

const apiBase = process.env.API_URL;

export default async function handler(req, res) {
    const { method } = req;

    if (method === 'POST') {
        const { headers: { cookie, ...rest }, method } = req;

        try {
            await axios({
                url: `${apiBase}upload`,
                method: 'post',
                data: req,
                headers: {
                    'content-type': rest['content-type'],
                    'content-length': rest['content-length']
                }
            }).then(function (response) {
                console.log(response);
            })
                .catch(function (error) {
                    console.log("-");
                });

            return res.status(200).end();
        } catch (error) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    return res.status(405).end(`Method ${method} Not Allowed`);
}
