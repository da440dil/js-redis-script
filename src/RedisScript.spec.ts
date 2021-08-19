import { createClient } from 'redis';
import Redis from 'ioredis';
import { Script } from './Script';
import { RedisScript } from './RedisScript';
import { IRedisClient } from './IRedisClient';

describe('RedisScript', () => {
	describe('with node-redis client', () => {
		testFunc(createClient());
	});

	describe('with ioredis client', () => {
		testFunc(new Redis());
	});
});

type Callback = (err: Error | null) => void;

interface IClient extends IRedisClient {
	flushdb(callback: Callback): void;
	quit(callback: Callback): void;
}

function testFunc(client: IClient): void {
	beforeAll((done) => {
		client.flushdb(done);
	});

	afterAll((done) => {
		client.quit(done);
	});

	afterEach((done) => {
		client.flushdb(done);
	});

	it('should run script with (key, arg)', async () => {
		const src = 'return redis.call("incrby", KEYS[1], ARGV[1])';
		const script = new RedisScript(new Script(client, src), 1);
		const key1 = 'key1';

		await expect(script.run(key1, 2)).resolves.toBe(2);
		await expect(script.run(key1, 3)).resolves.toBe(5);
	});

	it('should run script with (key, arg, arg)', async () => {
		const src = 'return redis.call("incrby", KEYS[1], ARGV[1]) + redis.call("incrby", KEYS[1], ARGV[2])';
		const script = new RedisScript(new Script(client, src), 1);
		const key1 = 'key1';

		await expect(script.run(key1, 2, 3)).resolves.toBe(7);
		await expect(script.run(key1, 4, 5)).resolves.toBe(23);
	});

	it('should run script with (key, key, arg)', async () => {
		const src = 'return redis.call("incrby", KEYS[1], ARGV[1]) + redis.call("incrby", KEYS[2], ARGV[1])';
		const script = new RedisScript(new Script(client, src), 2);
		const key1 = 'key1';
		const key2 = 'key2';

		await expect(script.run(key1, key2, 2)).resolves.toBe(4);
		await expect(script.run(key1, key2, 3)).resolves.toBe(10);
	});

	it('should run script with (key, key, arg, arg)', async () => {
		const src = 'return redis.call("incrby", KEYS[1], ARGV[1]) + redis.call("incrby", KEYS[2], ARGV[2])';
		const script = new RedisScript(new Script(client, src), 2);
		const key1 = 'key1';
		const key2 = 'key2';

		await expect(script.run(key1, key2, 2, 3)).resolves.toBe(5);
		await expect(script.run(key1, key2, 4, 5)).resolves.toBe(14);
	});
}
