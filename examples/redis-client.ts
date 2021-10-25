import { IRedisClient as IClient } from '../src';

export interface IRedisClient extends IClient {
	flushdb(callback: (err: Error | null) => void): void;
}

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
