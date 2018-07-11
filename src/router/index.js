import ProfileRoutes from './profile';

const urlBase = '/api/v1';
const routes = server => {
  server.use(`${urlBase}/profile`, ProfileRoutes);

  server.use((req, res, next) => {
    res.status(500).json({
      status: 500,
      msg: 'Error on route. This route exist?',
      route: req.originalUrl
    });
    next();
  });
};

export default routes;
