import { createClient } from 'redis';
import { httpServer } from './http-server';
import { createScript } from '../src';

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
	const script = createScript<number>({ client, src, numberOfKeys: 1, batch: true });
	const key = 'test';
	const value = 1;
	const server = httpServer(() => script.run(key, value));
	server.listen(3000);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
