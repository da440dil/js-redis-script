import { createClient } from 'redis-v3';
import Redis from 'ioredis';
import { Script } from './Script';
import { RedisBatchScript } from './RedisBatchScript';
import { IRedisClient } from './IRedisClient';

describe('RedisBatchScript', () => {
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

	it('should run batch script with (key, arg)', async () => {
		const src = `
			local vs = {}
			for i = 1, table.getn(KEYS) do
				vs[i] = redis.call("incrby", KEYS[i], ARGV[i])
			end
			return vs
		`;
		const script = new RedisBatchScript(new Script(client, src), 1);
		const key1 = 'key1';

		await expect(Promise.all([
			script.run(key1, 2),
			script.run(key1, 3)
		])).resolves.toEqual([2, 5]);

		await expect(Promise.all([
			script.run(key1, 4),
			script.run(key1, 5)
		])).resolves.toEqual([9, 14]);
	});

	it('should run batch script with (key, arg, arg)', async () => {
		const src = `
			local vs = {}
			local j = 1
			for i = 1, table.getn(ARGV), 2 do
				vs[j] = redis.call("incrby", KEYS[j], ARGV[i]) + redis.call("incrby", KEYS[j], ARGV[i+1])
				j = j + 1
			end
			return vs
		`;
		const script = new RedisBatchScript(new Script(client, src), 1);
		const key1 = 'key1';

		await expect(Promise.all([
			script.run(key1, 2, 3),
			script.run(key1, 4, 5)
		])).resolves.toEqual([7, 23]);

		await expect(Promise.all([
			script.run(key1, 6, 7),
			script.run(key1, 8, 9)
		])).resolves.toEqual([47, 79]);
	});

	it('should run batch script with (key, key, arg)', async () => {
		const src = `
			local vs = {}
			local j = 1
			for i = 1, table.getn(KEYS), 2 do
				vs[j] = redis.call("incrby", KEYS[i], ARGV[j]) + redis.call("incrby", KEYS[i+1], ARGV[j])
				j = j + 1
			end
			return vs
		`;
		const script = new RedisBatchScript(new Script(client, src), 2);
		const key1 = 'key1';
		const key2 = 'key2';

		await expect(Promise.all([
			script.run(key1, key2, 2),
			script.run(key1, key2, 3)
		])).resolves.toEqual([4, 10]);

		await expect(Promise.all([
			script.run(key1, key2, 4),
			script.run(key1, key2, 5)
		])).resolves.toEqual([18, 28]);
	});

	it('should run batch script with (key, key, arg, arg)', async () => {
		const src = `
			local vs = {}
			local j = 1
			for i = 1, table.getn(KEYS), 2 do
				vs[j] = redis.call("incrby", KEYS[i], ARGV[i]) + redis.call("incrby", KEYS[i+1], ARGV[i+1])
				j = j + 1
			end
			return vs
		`;
		const script = new RedisBatchScript(new Script(client, src), 2);
		const key1 = 'key1';
		const key2 = 'key2';

		await expect(Promise.all([
			script.run(key1, key2, 2, 3),
			script.run(key1, key2, 4, 5)
		])).resolves.toEqual([5, 14]);

		await expect(Promise.all([
			script.run(key1, key2, 6, 7),
			script.run(key1, key2, 8, 9)
		])).resolves.toEqual([27, 44]);
	});
}
