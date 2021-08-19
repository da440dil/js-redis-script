import { createClient } from 'redis';
import { app } from './fizz-buzz-batch';

async function main() {
	const client = createClient();
	await app(client);
	client.quit();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
