const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults({
    static: './public'
});

const PORT = 3000;

server.use(middlewares);

// Add custom routes before JSON Server router
server.use('/api', router);

server.listen(PORT, () => {
    console.log(`JSON Server is running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}/pages/GestionAtracciones.html`);
});
