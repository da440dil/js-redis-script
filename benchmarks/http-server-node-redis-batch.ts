import { createClient } from 'redis-v3';
import { httpServer } from './http-server';
import { batchScript } from '../src';

async function main() {
	const client = createClient();
	await new Promise<void>((resolve, reject) => {
		client.flushdb((err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		});
	});

	const src = `
		local vs = {}
		for i = 1, table.getn(KEYS) do
			vs[i] = redis.call("incrby", KEYS[i], ARGV[i])
		end
		return vs
	`;
	const script = batchScript<number>(client, src, 1);
	const key = 'test';
	const value = 1;
	const server = httpServer(() => script.run(key, value));
	server.listen(3000);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
