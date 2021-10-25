import { createServer } from 'http';
import { strictEqual } from 'assert';
import autocannon from 'autocannon';
import { createScript, IRedisScript } from '../src';
import { IRedisClient, flush, flushdb } from './redis-client';

export const app = async (clientName: string, client: IRedisClient): Promise<void> => {
	await flush(client);
	await flushdb(client);

	const key = 'test';
	const value = 1;
	const duration = parseInt(process.env.HTTP_BENCHMARK_DURATION || '5000', 10);

	const simpleScript = createScript<number>({
		client,
		src: 'return redis.call("incrby", KEYS[1], ARGV[1])',
		numberOfKeys: 1
	});
	const simpleScriptResult = await test(client, simpleScript, key, value, duration);

	const batchScript = createScript<number>({
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
	const batchScriptResult = await test(client, batchScript, key, value, duration);

	console.log('Benchmarks results with "%s" client:', clientName);
	console.table({
		'Script': {
			'Total (req)': simpleScriptResult.requests.total,
			'Total (ms)': duration,
			'Avg (req/sec)': simpleScriptResult.requests.average
		},
		'BatchScript': {
			'Total (req)': batchScriptResult.requests.total,
			'Total (ms)': duration,
			'Avg (req/sec)': batchScriptResult.requests.average
		}
	});
};

async function test(client: IRedisClient, script: IRedisScript<string | number>, key: string, value: number, durationMs: number): Promise<autocannon.Result> {
	const server = createServer((req, res) => {
		if (req.method !== 'GET') {
			res.writeHead(405);
			res.end();
			return;
		}
		script.run(key, value)
			.then((v) => {
				res.writeHead(200);
				res.end(String(v));
			})
			.catch((err) => {
				console.error(err);
				res.writeHead(500);
				res.end();
			});
	});
	const port = parseInt(process.env.HTTP_SERVER_PORT || '3000', 10);
	server.listen(port);
	const result = await autocannon({ url: `http://localhost:${port}`, duration: durationMs / 1000 });
	strictEqual(result.errors, 0);
	server.close();
	await flushdb(client);
	return result;
}
