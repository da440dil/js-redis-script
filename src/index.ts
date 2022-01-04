import { Script } from './Script';
import { RedisScript } from './RedisScript';
import { RedisBatchScript } from './RedisBatchScript';
import { IRedisClient } from './IRedisClient';
import { INodeRedisClient, NodeRedisScript } from './NodeRedisScript';
import { IRedisScript } from './IRedisScript';

export { IRedisClient, INodeRedisClient, IRedisScript };

/**
 * Creates script with any of supported Redis clients.
 * @param client Minimal Redis client interface: [node-redis](https://github.com/NodeRedis/node-redis) v3 or v4 or [ioredis](https://github.com/luin/ioredis) v4.
 * @param src Lua [script](https://redis.io/commands/eval) source code.
 * @param numberOfKeys The number of arguments that represent Redis [key names](https://redis.io/commands/eval#introduction-to-eval). By default equals 0.
 */
export const createScript = <T = unknown>(client: IRedisClient | INodeRedisClient, src: string, numberOfKeys = 0): IRedisScript<T> => {
	if ('evalSha' in client) {
		return new NodeRedisScript(client, src, numberOfKeys);
	}
	return new RedisScript(new Script(client, src), numberOfKeys);
};

/**
 * Creates script.
 * @param client Minimal Redis client interface: [node-redis](https://github.com/NodeRedis/node-redis) v4.
 * @param src Lua [script](https://redis.io/commands/eval) source code.
 * @param numberOfKeys The number of arguments that represent Redis [key names](https://redis.io/commands/eval#introduction-to-eval). By default equals 0.
 */
export const redisScript = <T = unknown>(client: INodeRedisClient, src: string, numberOfKeys = 0): IRedisScript<T> => {
	return new NodeRedisScript(client, src, numberOfKeys);
};

/**
 * Creates batch script.
 * 
 * The source code of a batch script must "know" the number of keys and values needed to make single operation,
 * must map an arbitrary number of arguments into keys and values needed to make each operation and must return an array containing the reply to each operation.
 * 
 * *Note*: When using batch script instead of simple script
 * in the context of [HTTP request](https://nodejs.org/api/http.html#http_class_http_incomingmessage),
 * there is no performance gain because of performance of [HTTP server](https://nodejs.org/api/http.html#http_class_http_server).
 * Measure perfomance gained of using batch script in your particular case.
 * 
 * @param client Minimal Redis client interface: [node-redis](https://github.com/NodeRedis/node-redis) v3 or [ioredis](https://github.com/luin/ioredis) v4.
 * @param src Lua [script](https://redis.io/commands/eval) source code.
 * @param numberOfKeys The number of arguments that represent Redis [key names](https://redis.io/commands/eval#introduction-to-eval). By default equals 0.
 */
export const batchScript = <T = unknown>(client: IRedisClient, src: string, numberOfKeys = 0): IRedisScript<T> => {
	return new RedisBatchScript(new Script(client, src), numberOfKeys);
};
