import { createScript } from '../src';
import { IRedisClient, flushdb } from './redis-client';

export const app = async (client: IRedisClient): Promise<void> => {
	await flushdb(client);

	const src = `
		local v = redis.call("incr", KEYS[1])
		if v % 15 == 0 then
			return "Fizz Buzz"
		elseif v % 3 == 0 then
			return "Fizz"
		elseif v % 5 == 0 then
			return "Buzz"
		else
			return v
		end
	`;
	const script = createScript(client, src, 1);
	const key = 'test';

	const replies = await Promise.all(Array.from({ length: 15 }, () => script.run(key)));
	console.log(replies.join(', '));
	// Output:
	// 1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, Fizz Buzz

	await flushdb(client);
};
