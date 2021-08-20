import { IScript, Args, Callback } from './IScript';

export class BatchScript<T> implements IScript<T> {
	private keys: (string | number)[] = [];
	private values: (string | number)[] = [];
	private callbacks: Callback<T>[] = [];
	private numberOfCalls = 0;
	private script: IScript<T[]>;
	private numberOfKeys: number;

	constructor(script: IScript<T[]>, numberOfKeys: number) {
		this.script = script;
		this.numberOfKeys = numberOfKeys;
	}

	public run(args: Args, callback: Callback<T>): void {
		this.keys.push(...args.slice(0, this.numberOfKeys));
		this.values.push(...args.slice(this.numberOfKeys));
		this.callbacks.push(callback);
		this.numberOfCalls++;
		if (this.numberOfCalls === 1) {
			setImmediate(() => {
				const args: Args = [this.numberOfKeys * this.numberOfCalls, ... this.keys, ...this.values];
				const callbacks = this.callbacks;
				this.keys = [];
				this.values = [];
				this.callbacks = [];
				this.numberOfCalls = 0;
				this.script.run(args, (err, reply?: T[]) => {
					if (!Array.isArray(reply)) {
						reply = [];
					}
					for (let i = 0; i < callbacks.length; i++) {
						callbacks[i](err, reply[i]);
					}
				});
			});
		}
	}
}
