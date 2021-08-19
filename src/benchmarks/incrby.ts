import { hrtime } from 'process';
import { strictEqual } from 'assert';
import { createScript, IRedisScript } from '..';
import { IRedisClient, flush, flushdb, get } from './redis-client';

export const app = async (clientName: string, client: IRedisClient): Promise<void> => {
	await flush(client);
	await flushdb(client);

	const key = 'test';
	const value = 1;
	const batchSize = parseInt(process.env.BENCHMARK_BATCH_SIZE || '10000', 10);

	const simpleScript = createScript({
		client,
		src: 'return redis.call("incrby", KEYS[1], ARGV[1])',
		numberOfKeys: 1
	});
	const simpleScriptTime = await test(client, simpleScript, key, value, batchSize);

	const batchScript = createScript({
		client,
		src: `
			local vs = {}
			for i = 1, table.getn(KEYS) do
				vs[i] = redis.call("incrby", KEYS[i], ARGV[i])
			end
			return vs
		`,
		numberOfKeys: 1,
		batch: true
	});
	const batchScriptTime = await test(client, batchScript, key, value, batchSize);

	console.log('Benchmarks results with "%s" client:', clientName);
	console.table({
		'Script': {
			'Total (req)': batchSize,
			'Total (ms)': simpleScriptTime,
			'Avg (req/sec)': toReqPerSec(batchSize, simpleScriptTime)
		},
		'BatchScript': {
			'Total (req)': batchSize,
			'Total (ms)': batchScriptTime,
			'Avg (req/sec)': toReqPerSec(batchSize, batchScriptTime)
		}
	});
};

async function test(client: IRedisClient, script: IRedisScript<unknown>, key: string, value: number, batchSize: number): Promise<number> {
	await script.run(key, value);
	const start = hrtime.bigint();
	await Promise.all(Array.from({ length: batchSize }, () => script.run(key, value)));
	const end = hrtime.bigint();
	const v = await get(client, key);
	strictEqual(v, batchSize + 1);
	await flushdb(client);
	return Math.round(Number(end - start) * 1e-6 * 100) / 100;
}

function toReqPerSec(batchSize: number, timeMs: number): number {
	return Math.round(((batchSize * 1000) / timeMs) * 100) / 100;
}
