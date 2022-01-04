import { IRedisClient, createScript } from '../src';

export const app = async (client: IRedisClient): Promise<void> => {
	const src = 'return redis.call("ping")';
	const script = createScript(client, src);

	const reply = await script.run();
	console.log('PING', reply);
	// Output:
	// PING PONG
};
