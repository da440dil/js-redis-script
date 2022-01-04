import { createClient } from 'redis-v3';
import { app } from './incrby';

async function main() {
	const client = createClient();
	await app('node-redis', client);
	client.quit();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
