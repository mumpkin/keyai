/** Where the save file lives: one serialised `keyai-save` document. */
export interface SaveStorage {
	readonly load: () => Promise<string | null>;
	readonly save: (content: string) => Promise<void>;
	/** Sets aside a save that cannot be read, before it gets replaced. */
	readonly keepUnreadable: (content: string) => Promise<void>;
	readonly loadUnreadable: () => Promise<string | null>;
	/** Calls back when another tab of the app saves its progress. */
	readonly onExternalSave: (listener: (content: string) => void) => void;
}

/** The window of the desktop app, which has no system title bar. */
export interface WindowControls {
	readonly minimize: () => Promise<void>;
	readonly toggleMaximize: () => Promise<void>;
	readonly close: () => Promise<void>;
	readonly isMaximized: () => Promise<boolean>;
	/** Resolves to the function that stops listening. */
	readonly onResized: (listener: () => void) => Promise<() => void>;
}

/** Everything that differs between the web and the desktop app (A5). */
export interface Platform {
	readonly name: 'web' | 'tauri';
	readonly storage: SaveStorage;
	/** Otherwise the splash only plays on the first launch (C8). */
	readonly playsSplashOnEveryLaunch: boolean;
	readonly windowControls: WindowControls | null;
	/** Calls back with the way to apply a new version, once one is ready. */
	readonly watchForUpdate: (onReady: (apply: () => void) => void) => void;
	/** Resolves to `false` when the user cancels. */
	readonly exportFile: (
		fileName: string,
		content: string,
	) => Promise<boolean>;
}
