/* eslint-disable @typescript-eslint/no-explicit-any */
import { Callback } from './IScript';

/** Minimal Redis client interface: [node-redis](https://github.com/NodeRedis/node-redis) v3 or [ioredis](https://github.com/luin/ioredis) v4. */
export interface IRedisClient {
	evalsha(args: (string | number)[], callback: Callback<any>): boolean;
	eval(args: (string | number)[], callback: Callback<any>): boolean;
}
