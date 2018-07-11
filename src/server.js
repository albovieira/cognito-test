import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './router';

const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const server = express();
const PORT = process.env.PORT || 3000;
process.env.SECRET = 'maxmilhas';

server.use(express.static('app/dist'));

server.set('secret', process.env.SECRET);
server.use(cors());
server.use(bodyParser.json());
server.use(morgan('dev'));

server.use(async (req, res, next) => {
  try {
    // console.log('original');
    const token = req.headers.authorization;
    if (token) {
      const decoded = await jwt.verify(token, process.env.SECRET);
      req.user = decoded;
      return next();
    }
    throw new Error('No token provided');
  } catch (error) {
    return res.status(403).send({
      message: 'No token provided.'
    });
  }
});

routes(server);

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
