import { createScript } from '..';
import { IRedisClient, flushdb } from './redis-client';

export const app = async (client: IRedisClient): Promise<void> => {
	await flushdb(client);

	const src = `
		local vs = {}
		for i = 1, table.getn(KEYS) do
			local v = redis.call("incr", KEYS[i])
			if v % 15 == 0 then
				vs[i] = "Fizz Buzz"
			elseif v % 3 == 0 then
				vs[i] = "Fizz"
			elseif v % 5 == 0 then
				vs[i] = "Buzz"
			else
				vs[i] = v
			end
		end
		return vs
	`;
	const script = createScript({ client, src, numberOfKeys: 1, batch: true });
	const key = 'test';

	const replies = await Promise.all(Array.from({ length: 15 }, () => script.run(key)));
	console.log(replies.join(', '));
	// Output:
	// 1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, Fizz Buzz

	await flushdb(client);
};
