const express = require('express');
const xss = require('xss');
const NotesService = require('./notes-service');

const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = note => (
    {
        id: note.id,
        note_name: xss(note.note_name),
        note_content: xss(note.note_content),
        note_owner: note.note_owner
    }
);

notesRouter
    .route('/')
    .get(function(req, res, next) {
        const ownerId = parseInt(req.decoded.id, 10);
        const knexInstance = req.app.get('db');
        NotesService.getNotesByOwnerId(knexInstance, ownerId)
            .then(notes => {
                res.json(notes.map(serializeNote))
            })
            .catch(next);
    })
    .post(jsonParser, function(req, res, next) {
        const ownerId = parseInt(req.decoded.id, 10);
        const { note_name, note_content } = req.body;
        const newNote = { note_name, note_content, ownerId};

        for (const [key, value] of Object.entries(newNote)) {
            if (value == null) {
                return res.status(400).json({
                    error: {
                        message: `Missing '${key}' in request body`
                    }
                });
            }
        }

        NotesService.insertNote(
            req.app.get('db'),
            newNote
        )
            .then(note => {
                res
                    .status(201)
                    .location(`/api/notes/${note.id}`)
                    .json(serializeNote(newNote))
                    .end();
            })
            .catch(next);
    });

notesRouter
    .route('/:note_id')
    .all(function(req, res, next) {
        NotesService.getById(
            req.app.get('db'),
            req.params.note_id,
            req.decoded.id
        )
            .then(note => {
                if (!note) {
                    return res.status(404).json({
                        error: { message: `note doesn't exist`}
                    });
                }
                res.note = note;
                next();
            })
    })
    .get(function(req, res, next) {
        res.json(serializeNote(res.note));
    })
    .delete(function(req, res, next) {
        NotesService.deleteNote(
            req.app.get('db'),
            req.params.note_id
        )
            .then(numRowsAffected => {
                res
                    .status(204)
                    .end();
            })
            .catch(next);
    });

module.exports = notesRouter;