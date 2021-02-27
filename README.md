# js-redis-script

[![Build Status](https://travis-ci.com/da440dil/js-redis-script.svg?branch=master)](https://travis-ci.com/da440dil/js-redis-script)
[![Coverage Status](https://coveralls.io/repos/github/da440dil/js-redis-script/badge.svg?branch=master)](https://coveralls.io/github/da440dil/js-redis-script?branch=master)

Optimistic [Redis](https://redis.io/) script runner.

[Example](./src/examples/example.ts) usage:

```typescript
import { createClient } from 'redis';
import { RedisScript } from '..';

async function main() {
    const client = createClient();
    const script = new RedisScript({
        client,
        src: 'return redis.call("ping")'
    });

    const res = await script.run(0);
    console.log('PING', res);
    // Output:
    // PING PONG

    client.quit();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
```
