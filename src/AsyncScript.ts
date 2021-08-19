import { IScript, Args } from './IScript';

export class AsyncScript<T> {
	private script: IScript<T>;

	constructor(script: IScript<T>) {
		this.script = script;
	}

	public run(args: Args): Promise<T> {
		return new Promise((resolve, reject) => {
			this.script.run(args, (err, reply) => {
				if (err) {
					return reject(err);
				}
				resolve(reply as T);
			});
		});
	}
}
