# js-redis-script

[![Build Status](https://travis-ci.com/da440dil/js-redis-script.svg?branch=main)](https://travis-ci.com/da440dil/js-redis-script)
[![Coverage Status](https://coveralls.io/repos/github/da440dil/js-redis-script/badge.svg?branch=main)](https://coveralls.io/github/da440dil/js-redis-script?branch=main)

[Redis](https://redis.io/) script runner.

It optimistically uses [EVALSHA](https://redis.io/commands/evalsha) to run the script. 
If script does not exist it retries using [EVAL](https://redis.io/commands/eval).

[Examples](./src/examples)

- [ping](./src/examples/ping.ts)
	```typescript
	import { IRedisClient, createScript } from '@da440dil/js-redis-script';

	export const app = async (client: IRedisClient): Promise<void> => {
		const src = 'return redis.call("ping")';
		const script = createScript({ client, src });

		const reply = await script.run();
		console.log('PING', reply);
		// Output:
		// PING PONG
	};
	```

- [fizz-buzz](./src/examples/fizz-buzz.ts)
	```typescript
	import { createScript } from '@da440dil/js-redis-script';
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
		const script = createScript({ client, src, numberOfKeys: 1 });
		const key = 'test';

		const replies = await Promise.all(Array.from({ length: 15 }, () => script.run(key)));
		console.log(replies.join(', '));
		// Output:
		// 1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, Fizz Buzz

		await flushdb(client);
	};
	```

- [fizz-buzz-batch](./src/examples/fizz-buzz-batch.ts)
	```typescript
	import { createScript } from '@da440dil/js-redis-script';
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
	```

[Benchmarks](./src/benchmarks)
```
npm run benchmarks
```

*Attention*: In the context of [HTTP request](https://nodejs.org/api/http.html#http_class_http_incomingmessage), 
there is no difference between [simple script](./src/Script.ts) and [batch script](./src/BatchScript.ts) 
because of performance of [HTTP server](https://nodejs.org/api/http.html#http_class_http_server). 
Use [batch script](./src/BatchScript.ts) where it really improves performance.
