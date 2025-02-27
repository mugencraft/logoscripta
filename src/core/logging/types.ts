export interface LoggerConfig {
	verbose?: boolean;
}

export interface ProgressOptions {
	/** Initial text to show */
	text: string;
	/** Optional color for the spinner */
	color?: "blue" | "yellow" | "green" | "red";
}

export interface Logger {
	error(message: unknown): void;
	info(message: unknown): void;
	success(message: unknown): void;
	warn(message: unknown): void;

	/**
	 * Starts a progress indicator
	 * @returns A function to update the progress text
	 */
	getProgress(options: ProgressOptions): {
		/** Updates the progress text */
		update: (text: string) => void;
		/** Marks the progress as complete with success */
		complete: (text?: string) => void;
		/** Marks the progress as failed */
		fail: (text?: string) => void;
	};
}
