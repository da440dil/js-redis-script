export interface IScript<T> {
	/**
	 * Runs script with specified args.
	 */
	run(args: Args, callback: Callback<T>): void;
}

export type Args = (string | number)[];

export type Callback<T> = (err: Error | null, reply?: T) => void;
