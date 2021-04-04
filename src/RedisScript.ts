import { createHash } from 'crypto';
import { RedisClient } from 'redis';

/**
 * RedisScript defines parameters for running script.
 */
export class RedisScript<T> {
	private client: RedisClient;
	private src: string;
	private hash: string;

	constructor({ client, src }: {
		/** Redis [client](https://github.com/NodeRedis/node-redis). */
		client: RedisClient;
		/** Redis [script](https://redis.io/commands/eval) to run. */
		src: string;
	}) {
		this.client = client;
		this.src = src;
		this.hash = createHash('sha1').update(src).digest('hex');
	}
	/**
	 * Run optimistically uses [EVALSHA](https://redis.io/commands/evalsha) to run the script.
	 * If script does not exist it is retried using [EVAL](https://redis.io/commands/eval).
	 */
	public async run(...args: (string | number)[]): Promise<T> {
		try {
			return await this.eval('evalsha', this.hash, args);
		} catch (err) {
			if (!(err instanceof Error && err.message.startsWith('NOSCRIPT '))) {
				throw err;
			}
			return this.eval('eval', this.src, args);
		}
	}

	private eval(method: 'evalsha' | 'eval', src: string, args: (string | number)[]): Promise<T> {
		return new Promise((resolve, reject) => {
			this.client[method](src, ...args, (err, res) => {
				if (err) {
					return reject(err);
				}
				resolve(res);
			});
		});
	}
}
