import { Script } from './Script';
import { RedisScript } from './RedisScript';
import { RedisBatchScript } from './RedisBatchScript';
import { IRedisClient } from './IRedisClient';
import { IRedisScript } from './IRedisScript';

export { IRedisClient, IRedisScript };

/** Creates redis script. */
export const createScript = <T>({ client, src, numberOfKeys = 0, batch = false }: {
	/**
	 * Redis client: [node-redis](https://github.com/NodeRedis/node-redis) or [ioredis](https://github.com/luin/ioredis).
	 */
	client: IRedisClient;
	/**
	 * Lua [script](https://redis.io/commands/eval) source code.
	 */
	src: string;
	/** 
	 * The number of arguments that represent Redis [key names](https://redis.io/commands/eval#introduction-to-eval).
	 * By default equals 0.
	 */
	numberOfKeys?: number;
	/** 
	 * The source code is a batch script, which means that the script must "know" the number of keys and values needed to make single operation,
	 * must map an arbitrary number of arguments into keys and values needed to make each operation and must return an array containing the reply to each operation.
	 * By default equals false.
	 * 
	 * *Note*: When using batch script instead of simple script
	 * in the context of [HTTP request](https://nodejs.org/api/http.html#http_class_http_incomingmessage),
	 * there is no performance gain because of performance of [HTTP server](https://nodejs.org/api/http.html#http_class_http_server). 
	 * Measure perfomance gained of using batch script in your particular case.
	 */
	batch?: boolean;
}): IRedisScript<T> => {
	if (batch) {
		return new RedisBatchScript(new Script(client, src), numberOfKeys);
	}
	return new RedisScript(new Script(client, src), numberOfKeys);
};
