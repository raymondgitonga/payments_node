const express = require('express');
const path = require('path');
const app = express();

const port = process.env.PORT || 9992


app.get('/', (req, res)=>{
    res.send('Home page ');
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Routes
app.use('/mobile', require('./routes/mpesa'));

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}....`);
});

module.exports = app;