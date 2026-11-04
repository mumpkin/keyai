import { defineConfig } from 'vitest/config';

const CORE_COVERAGE_THRESHOLD = 90;

export default defineConfig({
	test: {
		passWithNoTests: true,
		projects: [
			{
				test: {
					name: 'core',
					root: './packages/core',
					environment: 'node',
				},
			},
			{
				test: {
					name: 'vocab',
					root: './packages/vocab',
					environment: 'node',
				},
			},
			{
				test: {
					name: 'tools',
					root: './tools',
					environment: 'node',
				},
			},
		],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov'],
			include: ['packages/core/src/**/*.ts'],
			exclude: [
				'**/*.test.ts',
				'**/test-helpers.ts',
				'**/index.ts',
				'**/types.ts',
			],
			thresholds: {
				lines: CORE_COVERAGE_THRESHOLD,
				functions: CORE_COVERAGE_THRESHOLD,
				branches: CORE_COVERAGE_THRESHOLD,
				statements: CORE_COVERAGE_THRESHOLD,
			},
		},
	},
});
