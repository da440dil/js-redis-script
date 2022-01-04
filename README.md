# js-redis-script

[![Build Status](https://travis-ci.com/da440dil/js-redis-script.svg?branch=main)](https://travis-ci.com/da440dil/js-redis-script)
[![Coverage Status](https://coveralls.io/repos/github/da440dil/js-redis-script/badge.svg?branch=main)](https://coveralls.io/github/da440dil/js-redis-script?branch=main)

[Redis](https://redis.io/) script runner.

It optimistically uses [EVALSHA](https://redis.io/commands/evalsha) to run the script. 
If script does not exist it retries using [EVAL](https://redis.io/commands/eval).

Supported Redis clients: [node-redis](https://github.com/NodeRedis/node-redis) v3 and v4, [ioredis](https://github.com/luin/ioredis) v4.

[Example](./examples/ping-node-redis-v4.ts) usage with [node-redis](https://github.com/NodeRedis/node-redis) v4:
```typescript
import { createClient } from 'redis';
import { createScript } from '@da440dil/js-redis-script';

async function main() {
	const client = createClient();
	await client.connect();

	const script = createScript(client, 'return redis.call("ping")');
	const reply = await script.run();
	console.log('PING', reply);
	// Output:
	// PING PONG

	await client.quit();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
```

[Benchmarks](./benchmarks)
```
npm run benchmarks
```
