require('dotenv').config()

const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const apiRouter = require('./api/routes/apiRouter');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);
app.use('/', express.static(path.join(__dirname, '/views/login')));
app.use('/app', express.static(path.join(__dirname, '/public')));
app.use('/products', express.static(path.join(__dirname, '/views/products')));

app.use('/products/:id', (req, res) => {
    express.static(path.join(__dirname, '/views/products'), {
        setHeaders: function (res) {
            res.set('id', req.params.id);
        }
    })(req,res);
});






var port = process.env.PORT || 3000;
app.listen(port)