import { createClient } from 'redis-v3';
import { app } from './fizz-buzz';

async function main() {
	const client = createClient();
	await app(client);
	client.quit();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
