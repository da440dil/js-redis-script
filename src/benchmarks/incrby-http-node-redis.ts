import { createClient } from 'redis';
import { app } from './incrby-http';

async function main() {
	const client = createClient();
	await app('node-redis', client);
	client.quit();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
