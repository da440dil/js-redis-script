import { Args, Callback } from './IScript';
import { AsyncScript } from './AsyncScript';

describe('AsyncScript', () => {
	const run = jest.fn();
	const script = new AsyncScript({ run });

	it('should run', async () => {
		const reply = 'some reply';
		run.mockImplementation((_: Args, callback: Callback<string>) => {
			setImmediate(callback, null, reply);
		});

		await expect(script.run([])).resolves.toBe(reply);
	});

	it('should handle error', async () => {
		const err = new Error('Some error');
		run.mockImplementation((_: Args, callback: Callback<string>) => {
			setImmediate(callback, err);
		});

		await expect(script.run([])).rejects.toBe(err);
	});
});
