import morgan from 'morgan';

const requestLogger = morgan('dev');

export { requestLogger };