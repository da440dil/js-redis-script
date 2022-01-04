import { createClient } from 'redis-v4';
import { createScript } from '../src';

async function main() {
	const client = createClient();
	await client.connect();

	const script = createScript(client, 'return redis.call("ping")');
	const reply = await script.run();
	console.log('PING', reply);
	// Output:
	// PING PONG

	await client.quit();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
