import { IRedisClient as IClient } from '../src';

export interface IRedisClient extends IClient {
	script(arg: string, callback: (err: Error | null) => void): void;
	flushdb(callback: (err: Error | null) => void): void;
	get(key: string, callback: (err: Error | null, reply?: string | null) => void): void;
}

export const flush = (client: IRedisClient): Promise<void> => {
	return new Promise<void>((resolve, reject) => {
		client.script('flush', (err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		});
	});
};

export const flushdb = (client: IRedisClient): Promise<void> => {
	return new Promise<void>((resolve, reject) => {
		client.flushdb((err) => {
			if (err) {
				return reject(err);
			}
			resolve();
		});
	});
};

export const get = (client: IRedisClient, key: string): Promise<number> => {
	return new Promise((resolve, reject) => {
		client.get(key, (err, v) => {
			if (err) {
				return reject(err);
			}
			resolve(v ? Number(v) : 0);
		});
	});
};
