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
            const headers = {
                'content-type': rest['content-type'],
            };

            if (rest['content-length']) {
                headers['content-length'] = rest['content-length'];
            }

            await fetch(`${apiBase}upload`, {
                method: 'post',
                body: req,
                headers,
                duplex: 'half',
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
