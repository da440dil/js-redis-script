import autocannon from 'autocannon';
import { createClient } from 'redis';
import { httpServer } from './http-server';
import { createScript } from '..';

async function main() {
	const client = createClient();
	client.flushdb();

	const src = 'return redis.call("incrby", KEYS[1], ARGV[1])';
	const script = createScript<number>({ client, src, numberOfKeys: 1 });
	const key = 'test';
	const value = 1;
	const server = httpServer(() => script.run(key, value));
	server.listen(3000);

	const result = await autocannon({ url: 'http://localhost:3000' });
	console.log(result);

	server.close();
	client.quit();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
