// app.js

const Express = require('./express');

const app = new Express();

app.use((req, res, next) => {
    console.log('Middleware executed');
    next();
})



//For quey route
app.get('/', (req, res) => {
    // I want to show quey

    res.send('Hello World!');
});

app.get('/:id/:like', (req, res) => {
    const { id, like } = req.params;
    res.json({ message: `Hello World! Your params: ${id} and like ${like}` });
});


app.put('/', (req, res) => {
    res.status(200).json({ message: 'PUT request received' });
});

app.post('/', (req, res) => {
    const { name, password } = req.body;
    res.status(200).json({ name, password });
});

app.delete('/', (req, res) => {
    res.send('Delete request accepted');
});

app.get('/sendfile', (req, res) => {
    res.sendFile('index.html');
});

app.start(3000);
