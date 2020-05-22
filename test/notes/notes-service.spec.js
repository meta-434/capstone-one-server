require('dotenv').config();
const mocha = require('mocha');
const { expect } = require('chai');
const supertest = require('supertest');
const NotesService = require('../../src/notes/notes-service.js');
const knex = require('knex');
const app = require('../../src/app')

mocha.describe(`Notes service object`, () => {
    let db;
    let testUsers = [
        {
            username: 'user1',
            password: 'password1',
            admin: false,
        },
        {
            username: 'user2',
            password: 'password2',
            admin: false,
        }
    ];

    let user1Id, user2Id;
    let note1Id, note2Id;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        });

        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('clean the tables before ', () => db.raw('TRUNCATE TABLE users, notes RESTART IDENTITY CASCADE'));

    afterEach('clean the tables afterEach', () =>  db.raw('TRUNCATE TABLE users, notes RESTART IDENTITY CASCADE'));

    context(`Given 'notes' has data`, () => {
        // populate users for owner_id FK on notes
        beforeEach(() => {
            return db
                .into('users')
                .insert(testUsers)
                .returning('id')
                .then((res) => {
                    user1Id = res[0];
                    user2Id = res[1];
                    return db.into('notes')
                        .insert([
                            {
                                note_owner: user1Id,
                                note_name: 'First test post!',
                                note_content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?'
                            },
                            {
                                note_owner: user2Id,
                                note_name: 'second test post!',
                                note_content: 'content for note 2'
                            }
                        ])
                        .returning('id')
                        .then(res => {
                            note1Id = res[0];
                            note2Id = res[1];
                        });
                })
        });

        it(`getAllNotes() resolves all notes from 'notes table`, () => {
            return NotesService.getAllNotes(db)
                .then(actual => {
                    expect(actual).to.eql([
                        {
                            id: note1Id,
                            note_owner: user1Id,
                            note_name: 'First test post!',
                            note_content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?'
                        },
                        {
                            id: note2Id,
                            note_owner: user2Id,
                            note_name: 'second test post!',
                            note_content: 'content for note 2'
                        }
                    ]);
                });
        });

        it(`getNotesByOwnerId() resolves a Notes by an owner_id from 'notes' table`, () => {
            return NotesService.getNotesByOwnerId(db, user2Id)
                .then(actual => {
                    expect(actual).to.eql([{
                        id: note2Id,
                        note_name: 'second test post!',
                        note_content: 'content for note 2',
                        note_owner: user2Id,
                    }]);
                });
        });

        it(`deleteNote() removes an Note by id from 'notes' table`, () => {
            return NotesService.deleteNote(db, note2Id)
                .then(() => NotesService.getAllNotes(db))
                .then(allNotes => {
                    // copy the test notes array without the "deleted" Note
                    const expected = [{
                        id: note1Id,
                        note_owner: user1Id,
                        note_name: 'First test post!',
                        note_content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?'
                    }];
                    expect(allNotes).to.eql(expected);
                });
        });

    });

    context(`Given 'notes' has no data`, () => {

        beforeEach('get owner Id\'s', () => {
            return db
                .into('users')
                .insert(testUsers)
                .returning('id')
                .then((res) => {
                    user1Id = res[0];
                    user2Id = res[1];
                });
        });

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
                ownerId: user1Id,
            }
            return NotesService.insertNote(db, newNote)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        note_name: newNote.note_name,
                        note_content: newNote.note_content,
                        note_owner: user1Id,
                    });
                });
        }));
    });
});