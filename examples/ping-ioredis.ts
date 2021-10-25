import Redis from 'ioredis';
import { app } from './ping';

async function main() {
	const client = new Redis();
	await app(client);
	await client.quit();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
