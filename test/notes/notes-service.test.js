require('dotenv').config();
const mocha = require('mocha');
const { expect } = require('chai');
const supertest = require('supertest');
const NotesService = require('../../src/notes/notes-service.js');
const knex = require('knex');

mocha.describe(`Notes service object`, () => {
    let db;
    let testUsers = [
        {
            username: 'user1',
            password: 'password1',
            admin: false
        },
    ];

    let user1Id;
    let note1Id;

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        });
    });

    before(() => {db.raw('TRUNCATE TABLE users, notes CASCADE')});

    afterEach(() =>  {db.raw('TRUNCATE TABLE users, notes CASCADE')});

    after(() => db.destroy());

    context(`Given 'notes' has data`, () => {
        // populate users for owner_id FK on notes
        beforeEach(() => {
            return db
                .into('users')
                .insert(testUsers)
                .returning('id')
                .then((res) => {
                    user1Id = res[0];
                    return db.into('notes')
                        .insert({
                            note_owner: res[0],
                            note_name: 'First test post!',
                            note_content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?'
                        })
                        .returning('id')
                        .then(res => note1Id = res[0]);
                })
        });

        it(`getAllNotes() resolves all notes from 'notes table`, () => {
            return NotesService.getAllNotes(db)
                .then(actual => {
                    expect(actual).to.eql([{
                        id: note1Id,
                        note_owner: user1Id,
                        note_name: 'First test post!',
                        note_content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?'
                    }]);
                });
        });

        it(`getById() resolves a Note by id from 'notes' table`, () => {
            const thirdId = 3;
            const thirdTestNote = testNotes[thirdId - 1];
            return NotesService.getById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        note_name: thirdTestNote.note_name,
                        note_content: thirdTestNote.note_content,
                        note_owner: thirdTestNote.note_owner,
                    });
                });
        });

        it(`deleteNote() removes an Note by id from 'notes' table`, () => {
            const articleId = 3;
            return NotesService.deleteNote(db, articleId)
                .then(() => NotesService.getAllNotes(db))
                .then(allNotes => {
                    // copy the test notes array without the "deleted" Note
                    const expected = testNotes.filter(Note => Note.id !== articleId);
                    expect(allNotes).to.eql(expected);
                });
        });

    });

    context(`Given 'notes' has no data`, () => {
        it(`getAllNotes() resolves an empty array`, () => {
            return NotesService.getAllNotes(db)
                .then(actual => {
                    expect(actual).to.eql([])
                });
        });

        it(`insertNote() inserts a new Note and resolves a new Note with an 'id'`, (() => {
            const newNote = {
                note_name: 'Test new note_name',
                note_content: 'Test new note_content',
                note_owner: 1,
            }
            return NotesService.insertNote(db, newNote)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        note_name: newNote.note_name,
                        note_content: newNote.note_content,
                        note_owner: 1,
                    });
                });
        }));
    });
});