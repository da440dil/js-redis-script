# js-redis-script

[![Build Status](https://travis-ci.com/da440dil/js-redis-script.svg?branch=main)](https://travis-ci.com/da440dil/js-redis-script)
[![Coverage Status](https://coveralls.io/repos/github/da440dil/js-redis-script/badge.svg?branch=main)](https://coveralls.io/github/da440dil/js-redis-script?branch=main)

[Redis](https://redis.io/) script runner. 
It optimistically uses [EVALSHA](https://redis.io/commands/evalsha) to run the script. 
If script does not exist it retries using [EVAL](https://redis.io/commands/eval).

[Example](./src/examples/example.ts) usage:

```typescript
import { createClient } from 'redis';
import { RedisScript } from '@da440dil/js-redis-script';

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
