require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const config = require('./config');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const sessionsRouter = require('./sessions/sessions-router');
const notesRouter = require('./notes/notes-router');

const app = express();

// set secret
app.set('Secret', config.SECRET_KEY);

// log requests
app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
    skip: () => NODE_ENV === 'test'
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

// cors and header obfuscation
app.use(cors());
app.use(helmet());

// routers
app.use('/api/sessions', sessionsRouter);
app.use('/api/notes', notesRouter);

app.post('/api/authenticate', (req, res) => {
    if (req.body.username ==='testuser') {
        if (req.body.password === 123) {
            // everything ok, create token
            const payload = {check: true};

            let token = jwt.sign(payload, app.get('Secret'), {
                expiresIn: 1440 //expires in 24 hours
            });

            res.json({
                message: 'authentication done',
                token: token
            });
        } else {
            res.json({message:"please check your password !"});
        }
    } else {
        res.json({message:"user not found !"});
    }
})


// '/' catcher
app.get('/', function(req, res) {
    res.send(`Hello world, I'm running on http://localhost:${process.env.PORT}`)
})

// error handling
app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
        response = { error: 'Server error' }
    } else {
        console.error(error);
        response = { message: error.message, error }
    }
    res.status(500).json(response).catch(next);
});

module.exports = app;