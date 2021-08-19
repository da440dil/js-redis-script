/**
 * Implements script running.
 */
export interface IRedisScript<T> {
	/**
	 * Run optimistically uses [EVALSHA](https://redis.io/commands/evalsha) to run the script.
	 * If script does not exist it is retried using [EVAL](https://redis.io/commands/eval).
	 */
	run(...args: (string | number)[]): Promise<T>;
}
