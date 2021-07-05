import { createClient } from 'redis';
import { RedisScript } from '..';

async function main() {
	const client = createClient();
	const script = new RedisScript({
		client,
		src: 'return redis.call("ping")'
	});

	const res = await script.run();
	console.log('PING', res);
	// Output:
	// PING PONG

	client.quit();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
