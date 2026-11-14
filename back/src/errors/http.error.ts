export class HttpError extends Error {
    constructor(
        public readonly statusCode: number,
        message: string,
        public readonly fieldErrors?: Record<string, string>,
    ) {
        super(message);
        this.name = new.target.name;
    }
}

export class BadRequestError extends HttpError {
    constructor(message: string, fieldErrors?: Record<string, string>) {
        super(400, message, fieldErrors);
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message: string) {
        super(401, message);
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string) {
        super(404, message);
    }
}

export class ConflictError extends HttpError {
    constructor(message: string, fieldErrors?: Record<string, string>) {
        super(409, message, fieldErrors);
    }
}

