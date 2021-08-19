/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from 'redis';
import Redis from 'ioredis';
import { Script } from './Script';
import { IRedisClient } from './IRedisClient';

describe('Script', () => {
	describe('with node-redis client', () => {
		testFunc(createClient());
	});

	describe('with ioredis client', () => {
		testFunc(new Redis());
	});
});

type Callback = (err: Error | null, reply: any) => void;

interface IClient extends IRedisClient {
	script(arg1: string, arg2: string, callback: Callback): void;
	script(arg1: string, callback: Callback): void;
	quit(callback: Callback): void;
}

function testFunc(client: IClient): void {
	const src = 'return redis.call("ping")';
	const script = new Script(client, src);

	beforeAll((done) => {
		client.script('flush', done);
	});

	afterAll((done) => {
		client.quit(done);
	});

	it('should run script', (done) => {
		script.run([0], (err, reply) => {
			expect(err).toBe(null);
			expect(reply).toBe('PONG');
			done();
		});
	});

	it('should load script', (done) => {
		client.script('exists', 'd1ba26e3351afe31c9d0b4f786e9dd5a661e6997', (err, reply) => {
			expect(err).toBe(null);
			expect(reply).toEqual([1]);
			done();
		});
	});

	it('should run script again', (done) => {
		script.run([0], (err, reply) => {
			expect(err).toBe(null);
			expect(reply).toBe('PONG');
			done();
		});
	});

	describe('errors', () => {
		const evalshaMock = jest.spyOn(client, 'evalsha');
		const evalMock = jest.spyOn(client, 'eval');

		afterAll(() => {
			evalshaMock.mockReset();
			evalMock.mockReset();
		});

		it('should handle redis error', (done) => {
			const redisErr = new Error('Some redis error');
			evalshaMock.mockImplementation((_, cb) => {
				cb(redisErr, '');
				return false;
			});

			script.run([0], (err, reply) => {
				expect(err).toBe(redisErr);
				expect(reply).toBe(undefined);
				done();
			});
		});

		it('should handle redis NOSCRIPT error', (done) => {
			const noScriptErr = new Error('NOSCRIPT No matching script. Please use EVAL.');
			const redisErr = new Error('Some redis error');
			evalshaMock.mockImplementation((_, cb) => {
				cb(noScriptErr, '');
				return false;
			});
			evalMock.mockImplementation((_, cb) => {
				cb(redisErr, '');
				return false;
			});

			script.run([0], (err, reply) => {
				expect(err).toBe(redisErr);
				expect(reply).toBe('');
				done();
			});
		});
	});
}
