
const express = require('express');
const xss = require('xss');
const SessionsService = require('./sessions-service');

const sessionsRouter = express.Router();
const jsonParser = express.json();

const serializeSession = session => (
    {
        id: session.id,
        session_name: xss(session.session_name),
        session_description: xss(session.session_description),
        session_owner: session.session_owner
    }
);

sessionsRouter
    .route('/')
    .get(function(req, res, next) {
        const ownerId = parseInt(req.decoded.id, 10);
        const knexInstance = req.app.get('db');
        SessionsService.getSessionsByOwnerId(knexInstance, ownerId)
            .then(sessions => {
                res.json(sessions.map(serializeSession))
            })
            .catch(next);
    })
    .post(jsonParser, function(req, res, next) {
        const ownerId = parseInt(req.decoded.id, 10);
        const { session_name, session_description } = req.body;
        const newSession = { session_name, session_description, ownerId};

        for (const [key, value] of Object.entries(newSession)) {
            if (value == null) {
                return res.status(400).json({
                    error: {
                        message: `Missing '${key}' in request body`
                    }
                });
            }
        }

        SessionsService.insertSession(
            req.app.get('db'),
            newSession
        )
            .then(session => {
                res
                    .status(201)
                    .location(`/api/sessions/${session.id}`)
                    .json(serializeSession(newSession))
                    .end();
            })
            .catch(next);
    });

sessionsRouter
    .route('/:session_id')
    .all(function(req, res, next) {
        SessionsService.getById(
            req.app.get('db'),
            req.params.session_id,
            req.decoded.id
        )
            .then(session => {
                if (!session) {
                    return res.status(404).json({
                        error: { message: `session doesn't exist`}
                    });
                }
                res.session = session;
                next();
            })
    })
    .get(function(req, res, next) {
        res.json(serializeSession(res.session));
    })
    .delete(function(req, res, next) {
        SessionsService.deleteSession(
            req.app.get('db'),
            req.params.session_id
        )
            .then(numRowsAffected => {
                res
                    .status(204)
                    .end();
            })
            .catch(next);
    });

module.exports = sessionsRouter;