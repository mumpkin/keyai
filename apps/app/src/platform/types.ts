/** Where the save file lives: one serialised `keyai-save` document. */
export interface SaveStorage {
	readonly load: () => Promise<string | null>;
	readonly save: (content: string) => Promise<void>;
}

/** Everything that differs between the web and the desktop app (A5). */
export interface Platform {
	readonly name: 'web' | 'tauri';
	readonly storage: SaveStorage;
	/** Otherwise the splash only plays on the first launch (C8). */
	readonly playsSplashOnEveryLaunch: boolean;
}
