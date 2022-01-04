import { createClient } from 'redis-v4';
import { NodeRedisScript } from './NodeRedisScript';

describe('NodeRedisScript', () => {
	const client = createClient();

	beforeAll(async () => {
		await client.connect();
		await client.FLUSHDB();
	});
	afterAll(async () => {
		await client.quit();
	});
	afterEach(async () => {
		await client.FLUSHDB();
	});

	it('should run script with (key, arg)', async () => {
		const src = 'return redis.call("incrby", KEYS[1], ARGV[1])';
		const script = new NodeRedisScript(client, src, 1);
		const key1 = 'key1';

		await expect(script.run(key1, 2)).resolves.toBe(2);
		await expect(script.run(key1, 3)).resolves.toBe(5);
	});

	it('should run script with (key, arg, arg)', async () => {
		const src = 'return redis.call("incrby", KEYS[1], ARGV[1]) + redis.call("incrby", KEYS[1], ARGV[2])';
		const script = new NodeRedisScript(client, src, 1);
		const key1 = 'key1';

		await expect(script.run(key1, 2, 3)).resolves.toBe(7);
		await expect(script.run(key1, 4, 5)).resolves.toBe(23);
	});

	it('should run script with (key, key, arg)', async () => {
		const src = 'return redis.call("incrby", KEYS[1], ARGV[1]) + redis.call("incrby", KEYS[2], ARGV[1])';
		const script = new NodeRedisScript(client, src, 2);
		const key1 = 'key1';
		const key2 = 'key2';

		await expect(script.run(key1, key2, 2)).resolves.toBe(4);
		await expect(script.run(key1, key2, 3)).resolves.toBe(10);
	});

	it('should run script with (key, key, arg, arg)', async () => {
		const src = 'return redis.call("incrby", KEYS[1], ARGV[1]) + redis.call("incrby", KEYS[2], ARGV[2])';
		const script = new NodeRedisScript(client, src, 2);
		const key1 = 'key1';
		const key2 = 'key2';

		await expect(script.run(key1, key2, 2, 3)).resolves.toBe(5);
		await expect(script.run(key1, key2, 4, 5)).resolves.toBe(14);
	});

	describe('errors', () => {
		const evalshaMock = jest.spyOn(client, 'EVALSHA');
		const evalMock = jest.spyOn(client, 'EVAL');

		afterAll(() => {
			evalshaMock.mockReset();
			evalMock.mockReset();
		});

		const script = new NodeRedisScript(client, '', 0);

		it('should handle redis error', async () => {
			const redisErr = new Error('Some redis error');
			evalshaMock.mockImplementation(() => Promise.reject(redisErr));

			await expect(script.run()).rejects.toThrowError(redisErr);
		});

		it('should handle redis NOSCRIPT error', async () => {
			const noScriptErr = new Error('NOSCRIPT No matching script. Please use EVAL.');
			const redisErr = new Error('Some redis error');
			evalshaMock.mockImplementation(() => Promise.reject(noScriptErr));
			evalMock.mockImplementation(() => Promise.reject(redisErr));

			await expect(script.run()).rejects.toThrowError(redisErr);
		});
	});
});
