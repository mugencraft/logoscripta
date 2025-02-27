import ora, { type Ora } from "ora";
import type { Logger, LoggerConfig, ProgressOptions } from "./types";

/**
 * Singleton logger implementation for console output with progress tracking
 * @example
 * const logger = ConsoleLogger.getInstance({ verbose: true });
 *
 * // Basic logging
 * logger.info("Starting process...");
 *
 * // Progress tracking
 * const progress = logger.progress({ text: 'Processing items...' });
 * for (let i = 0; i < items.length; i++) {
 *   progress.update(`Processing item ${i + 1}/${items.length}`);
 *   // ... process item
 * }
 * progress.complete('All items processed');
 */
export class ConsoleLogger implements Logger {
	private static instance: ConsoleLogger;
	private initialized: boolean;
	private verbose: boolean;
	private currentSpinner: Ora | null = null;

	private constructor(config?: LoggerConfig) {
		this.verbose = config?.verbose ?? false;
		this.initialized = true;
	}

	public static getInstance(config?: LoggerConfig): ConsoleLogger {
		if (!ConsoleLogger.instance) {
			ConsoleLogger.instance = new ConsoleLogger(config);
		} else if (config && !ConsoleLogger.instance.initialized) {
			ConsoleLogger.instance.verbose = config.verbose ?? false;
			ConsoleLogger.instance.initialized = true;
		}
		return ConsoleLogger.instance;
	}

	public error(message: unknown): void {
		this.clearSpinner();
		console.error(`[ERROR] ${this.formatMessage(message)}`);
	}

	public info(message: unknown): void {
		if (this.verbose) {
			this.clearSpinner();
			console.log(`[INFO] ${this.formatMessage(message)}`);
		}
	}

	public success(message: unknown): void {
		this.clearSpinner();
		console.log(`[OK] ${this.formatMessage(message)}`);
	}

	public warn(message: unknown): void {
		this.clearSpinner();
		console.warn(`[WARN] ${this.formatMessage(message)}`);
	}
	public getProgress(options: ProgressOptions) {
		// Clear any existing spinner
		this.clearSpinner();

		// Create new spinner
		this.currentSpinner = ora({
			text: options.text,
			color: options.color || "blue",
		}).start();

		return {
			update: (text: string) => {
				if (this.currentSpinner) {
					this.currentSpinner.text = text;
				}
			},
			complete: (text?: string) => {
				if (this.currentSpinner) {
					this.currentSpinner.succeed(text || options.text);
					this.currentSpinner = null;
				}
			},
			fail: (text?: string) => {
				if (this.currentSpinner) {
					this.currentSpinner.fail(text || options.text);
					this.currentSpinner = null;
				}
			},
		};
	}

	private clearSpinner(): void {
		if (this.currentSpinner) {
			this.currentSpinner.stop();
			this.currentSpinner = null;
		}
	}

	private formatMessage(message: unknown): string {
		if (typeof message === "string") {
			return message;
		}

		try {
			if (message instanceof Error) {
				return message.stack || message.message;
			}

			return JSON.stringify(message, null, 2);
		} catch (error) {
			return String(message);
		}
	}
}
