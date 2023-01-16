import { Request, Response } from 'express';
import createServer from './src/app';

const app = await createServer();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html');
  const response = {
    message: 'Welcome to the app Created by Hardik Garg',
  };

  res.send(response);
});
// default end point
app.use('*', (req, res) => {
  res.status(404).send({
    error: 'AUTH404: Could not find the page requested by you',
  });
});

app.listen(port, () => {
  console.log('App listening on port', port);
});
