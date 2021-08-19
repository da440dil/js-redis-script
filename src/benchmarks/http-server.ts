import { createServer, Server } from 'http';

export const httpServer = (fn: () => Promise<string | number>): Server => {
	return createServer((req, res) => {
		if (req.method !== 'GET') {
			res.writeHead(405);
			res.end();
			return;
		}

		fn()
			.then((v) => {
				res.writeHead(200);
				res.end(String(v));
			})
			.catch((err) => {
				console.error(err);
				res.writeHead(500);
				res.end();
			});
	});
};
