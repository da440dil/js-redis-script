import { createHash } from 'crypto';
import { IRedisScript } from './IRedisScript';

export class NodeRedisScript<T> implements IRedisScript<T> {
	private client: INodeRedisClient;
	private src: string;
	private hash: string;
	private numberOfKeys: number;

	constructor(client: INodeRedisClient, src: string, numberOfKeys: number) {
		this.client = client;
		this.src = src;
		this.hash = createHash('sha1').update(src).digest('hex');
		this.numberOfKeys = numberOfKeys;
	}

	public async run(...args: (string | number)[]): Promise<T> {
		const vs = args.map(String);
		const options: EvalOptions = {
			keys: vs.slice(0, this.numberOfKeys),
			arguments: vs.slice(this.numberOfKeys)
		};
		try {
			return await this.client.EVALSHA(this.hash, options) as Promise<T>;
		} catch (err) {
			if (err instanceof Error && err.message.startsWith('NOSCRIPT ')) {
				return this.client.EVAL(this.src, options) as Promise<T>;
			}
			throw err;
		}
	}
}

/** Minimal [node-redis](https://github.com/NodeRedis/node-redis) v4 client interface. */
export interface INodeRedisClient {
	EVALSHA(sha1: string, options?: EvalOptions): Promise<unknown>;
	EVAL(script: string, options?: EvalOptions): Promise<unknown>;
	evalSha(sha1: string, options?: EvalOptions): Promise<unknown>; // for duck typing
}

type EvalOptions = {
	keys?: string[];
	arguments?: string[];
};
