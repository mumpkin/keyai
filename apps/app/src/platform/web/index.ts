import type { Platform } from '../types.ts';
import { createWebStorage } from './storage.ts';

export function createPlatform(): Platform {
	return { name: 'web', storage: createWebStorage() };
}
