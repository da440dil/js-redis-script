import { Script } from './Script';
import { BatchScript } from './BatchScript';
import { AsyncScript } from './AsyncScript';
import { IRedisScript } from './IRedisScript';

export class RedisBatchScript<T> implements IRedisScript<T> {
	private script: AsyncScript<T>;

	constructor(script: Script<T[]>, numberOfKeys: number) {
		this.script = new AsyncScript(new BatchScript(script, numberOfKeys));
	}

	public run(...args: (string | number)[]): Promise<T> {
		return this.script.run(args);
	}
}
