import { createHash } from 'crypto';
import { IRedisClient } from './IRedisClient';
import { IScript, Args, Callback } from './IScript';

export class Script<T> implements IScript<T> {
	private client: IRedisClient;
	private src: string;
	private hash: string;

	constructor(client: IRedisClient, src: string) {
		this.client = client;
		this.src = src;
		this.hash = createHash('sha1').update(src).digest('hex');
	}

	public run(args: Args, callback: Callback<T>): void {
		this.client.evalsha([this.hash, ...args], (err, reply) => {
			if (err) {
				if (err instanceof Error && err.message.startsWith('NOSCRIPT ')) {
					return this.client.eval([this.src, ...args], callback);
				}
				return callback(err);
			}
			callback(null, reply);
		});
	}
}
