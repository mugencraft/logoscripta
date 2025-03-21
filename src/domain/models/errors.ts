export class SecurityError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "SecurityError";
	}
}

export class EntityNotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "EntityNotFoundError";
	}
}

export class ValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ValidationError";
	}
}
