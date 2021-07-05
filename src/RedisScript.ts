import { createHash } from 'crypto';
import { RedisClient } from 'redis';

/**
 * RedisScript defines parameters for running script.
 */
export class RedisScript<T> {
	private client: RedisClient;
	private src: string;
	private keysNum: number;
	private hash: string;

	constructor({ client, src, keysNum = 0 }: {
		/** Redis [client](https://github.com/NodeRedis/node-redis). */
		client: RedisClient;
		/** Redis [script](https://redis.io/commands/eval) to run. */
		src: string;
		/** 
		 * The number of arguments that represent Redis [key names](https://redis.io/commands/eval#introduction-to-eval).
		 * By default equals 0.
		 */
		keysNum?: number;
	}) {
		this.client = client;
		this.src = src;
		this.keysNum = keysNum;
		this.hash = createHash('sha1').update(src).digest('hex');
	}
	/**
	 * Run optimistically uses [EVALSHA](https://redis.io/commands/evalsha) to run the script.
	 * If script does not exist it is retried using [EVAL](https://redis.io/commands/eval).
	 */
	public async run(...args: (string | number)[]): Promise<T> {
		return new Promise((resolve, reject) => {
			this.client.evalsha(this.hash, this.keysNum, ...args, (err, res) => {
				if (err) {
					if (!(err instanceof Error && err.message.startsWith('NOSCRIPT '))) {
						return reject(err);
					}
					return this.client.eval(this.src, this.keysNum, ...args, (err, res) => {
						if (err) {
							return reject(err);
						}
						resolve(res);
					});
				}
				resolve(res);
			});
		});
	}
}
