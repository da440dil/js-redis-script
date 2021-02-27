import { createClient, Callback } from 'redis';
import { RedisScript } from './RedisScript';

describe('RedisScript', () => {
    const client = createClient();
    const script = new RedisScript({ client, src: 'return redis.call("ping")' });

    beforeAll((cb) => {
        client.script('flush', cb);
    });
    afterAll((cb) => {
        client.quit(cb);
    });

    it('should run script', async () => {
        await expect(script.run(0)).resolves.toBe('PONG');
    });

    it('should load script', async () => {
        await expect(new Promise((resolve, reject) => {
            client.script('exists', 'd1ba26e3351afe31c9d0b4f786e9dd5a661e6997', (err, res) => {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            });
        })).resolves.toEqual([1]);
    });

    it('should handle errors', async () => {
        const evalshaMock = jest.spyOn(client, 'evalsha');
        const someRedisErr = new Error('Some redis error');
        evalshaMock.mockImplementation(mockCallback(someRedisErr, ''));
        await expect(script.run(0)).rejects.toThrow(someRedisErr);

        const noScriptErr = new Error('NOSCRIPT No matching script. Please use EVAL.');
        evalshaMock.mockImplementation(mockCallback(noScriptErr, ''));
        const evalMock = jest.spyOn(client, 'eval');
        evalMock.mockImplementation(mockCallback(someRedisErr, ''));
        await expect(script.run(0)).rejects.toThrow(someRedisErr);
    });
});

function mockCallback(err: Error | null, res: string) {
    return (...args: (string | number | Callback<string>)[]): boolean => {
        const cb = args[args.length - 1];
        if (typeof cb === 'function') {
            cb(err, res);
        }
        return false;
    };
}
