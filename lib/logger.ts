import winston from "winston";

class Logger {
	private static instance: Logger;
	private logger: winston.Logger;

	private constructor() {
		this.logger = winston.createLogger({
			level: process.env.LOG_LEVEL || "info",
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.json()
			),
			transports: [
				new winston.transports.File({
					filename: "error.log",
					level: "error",
				}),
				new winston.transports.File({ filename: "combined.log" }),
			],
		});

		if (process.env.NODE_ENV !== "production") {
			this.logger.add(
				new winston.transports.Console({
					format: winston.format.combine(
						winston.format.colorize(),
						winston.format.simple()
					),
				})
			);
		}
	}

	public static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
	}

	public info(message: string, meta?: any): void {
		this.logger.info(message, meta);
	}

	public error(message: string, meta?: any): void {
		this.logger.error(message, meta);
	}

	public warn(message: string, meta?: any): void {
		this.logger.warn(message, meta);
	}

	public debug(message: string, meta?: any): void {
		this.logger.debug(message, meta);
	}
}

const logger = Logger.getInstance();
export default logger;
