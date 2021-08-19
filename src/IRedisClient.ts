/* eslint-disable @typescript-eslint/no-explicit-any */
import { Callback } from './IScript';

export interface IRedisClient {
	evalsha(args: (string | number)[], callback: Callback<any>): boolean;
	eval(args: (string | number)[], callback: Callback<any>): boolean;
}
