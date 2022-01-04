import { createClient } from 'redis-v3';
import { app } from './ping';

async function main() {
	const client = createClient();
	await app(client);
	client.quit();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
