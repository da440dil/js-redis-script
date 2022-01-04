import Redis from 'ioredis';
import { createClient as createClient3 } from 'redis-v3';
import { createClient as createClient4 } from 'redis-v4';
import { createScript, redisScript, batchScript } from '.';
import { RedisScript } from './RedisScript';
import { NodeRedisScript } from './NodeRedisScript';
import { RedisBatchScript } from './RedisBatchScript';

describe('createScript', () => {
	it('should create RedisScript with ioredis client', async () => {
		const client = new Redis();
		expect(createScript(client, '')).toBeInstanceOf(RedisScript);
		await client.quit();
	});

	it('should create RedisScript with node-redis v3 client', () => {
		const client = createClient3();
		expect(createScript(client, '')).toBeInstanceOf(RedisScript);
		client.quit();
	});

	it('should create NodeRedisScript with node-redis v4 client', () => {
		const client = createClient4();
		expect(createScript(client, '')).toBeInstanceOf(NodeRedisScript);
	});
});

describe('redisScript', () => {
	it('should create NodeRedisScript', () => {
		const client = createClient4();
		expect(redisScript(client, '')).toBeInstanceOf(NodeRedisScript);
	});
});

describe('batchScript', () => {
	it('should create RedisBatchScript with ioredis client', async () => {
		const client = new Redis();
		expect(batchScript(client, '')).toBeInstanceOf(RedisBatchScript);
		await client.quit();
	});

	it('should create RedisBatchScript with node-redis v3 client', () => {
		const client = createClient3();
		expect(batchScript(client, '')).toBeInstanceOf(RedisBatchScript);
		client.quit();
	});
});
