// app.js
const path = require('path');
const Express = require('./express');

const app = new Express();

//Use 
app.use((req, res, next) => {
    console.log('Middleware executed');
    next();
})


app.get('/all', (req, res) => {
    res.send('Hello World!');
});



app.get('/:st', (req, res) => {
    res.send('Good!');
});


//That for params
app.get('/:id/:like', (req, res) => {
    const { id, like } = req.params;
    res.json({ message: `Hello World! Your params: ${id} and like ${like}` });
});


//Put 
app.put('/', (req, res) => {
    res.status(200).json({ message: 'PUT request received' });
});

//Post
app.post('/', (req, res) => {
    const { name, password } = req.body;
    res.status(200).json({ name, password });
});

//Delete
app.delete('/', (req, res) => {
    res.send('Delete request accepted');
});



//SendFile
app.delete('/sendfile', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.start(3000);
