import { Script } from './Script';
import { AsyncScript } from './AsyncScript';
import { IRedisScript } from './IRedisScript';

export class RedisScript<T> implements IRedisScript<T> {
	private script: AsyncScript<T>;
	private numberOfKeys: number;

	constructor(script: Script<T>, numberOfKeys: number) {
		this.script = new AsyncScript(script);
		this.numberOfKeys = numberOfKeys;
	}

	public run(...args: (string | number)[]): Promise<T> {
		return this.script.run([this.numberOfKeys, ...args]);
	}
}
