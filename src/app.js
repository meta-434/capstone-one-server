require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const sessionsRouter = require('./sessions/sessions-router');
const notesRouter = require('./notes/notes-router');

const app = express();

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
    skip: () => NODE_ENV === 'test'
}));
app.use(cors());
app.use(helmet());

app.use('/api/sessions', sessionsRouter);
app.use('/api/notes', notesRouter);

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