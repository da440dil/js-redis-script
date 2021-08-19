import { Args, Callback } from './IScript';
import { BatchScript } from './BatchScript';

describe('BatchScript', () => {
	const run = jest.fn();
	const script = new BatchScript<number>({ run }, 0);

	const randomTimeout = randomInt.bind(null, 10, 50);
	const randomLength = randomInt.bind(null, 1, 50);

	Array.from({ length: 10 }, (_, i) => i).forEach(() => {
		const length = randomLength();
		it(`should run script with ${length} calls`, (done) => {
			const expected = Array.from({ length }, (_, i) => i);
			run.mockImplementation((_: Args, callback: Callback<number[]>) => {
				setTimeout(() => {
					callback(null, expected);
				}, randomTimeout());
			});

			const errors: (Error | null)[] = [];
			const replies: (number | undefined)[] = [];
			let i = length;
			const callback: Callback<number> = (err, reply) => {
				errors.push(err);
				replies.push(reply);
				i--;
				if (i > 0) {
					return;
				}
				expect(errors).toEqual(Array(length).fill(null));
				expect(replies).toEqual(expected);
				done();
			};

			for (let i = 0; i < length; i++) {
				script.run([], callback);
			}
		});
	});

	it('should handle errors', (done) => {
		const err = new Error('Some error');
		const length = randomLength();
		run.mockImplementation((_: Args, callback: Callback<number[]>) => {
			setTimeout(() => {
				callback(err);
			}, randomTimeout());
		});

		const errors: (Error | null)[] = [];
		const replies: (number | undefined)[] = [];
		let i = length;
		const callback: Callback<number> = (err, reply) => {
			errors.push(err);
			replies.push(reply);
			i--;
			if (i > 0) {
				return;
			}
			expect(errors).toEqual(Array(length).fill(err));
			expect(replies).toEqual(Array(length));
			done();
		};

		for (let i = 0; i < length; i++) {
			script.run([], callback);
		}
	});
});

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min);
}
