import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import bodyParser from 'body-parser';

const app = express();
const routes = require('./app/main').default;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.raw({ type: 'image/jpeg', limit: '10MB' }));
app.use(bodyParser.raw({ type: 'image/png', limit: '10MB' }));
app.use(express.json({ limit: '10MB' }));

app.use(express.static(path.join(__dirname, 'public')));

// Authentication
routes(app);

// / catch 404 and forward to error handler
app.use((req, res, next) => {
  const err: any = new Error('Not Found');
  err.status = 404;
  next(err);
});

// / error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500);
    console.error('500 error', {
      message: err.message,
      error: err,
      title: 'error',
    });

    res.json({
      message: err.message,
      error: err,
      title: 'error',
    });
  });
}

// production error handler
// no stacktraces leaked to user
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500);
  console.error('500 error', {
    message: err.message,
    error: err,
    title: 'error',
  });
});

export default app;
