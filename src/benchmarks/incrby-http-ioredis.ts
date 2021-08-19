import Redis from 'ioredis';
import { app } from './incrby-http';

async function main() {
	const client = new Redis();
	await app('ioredis', client);
	await client.quit();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
