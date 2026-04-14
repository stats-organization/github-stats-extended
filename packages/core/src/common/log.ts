/**
 * Return console instance based on the environment.
 */
const logger: {
  log: (...args: Array<unknown>) => void;
  error: (...args: Array<unknown>) => void;
} = {
  log: console.log,
  error: console.error,
};

export { logger };
