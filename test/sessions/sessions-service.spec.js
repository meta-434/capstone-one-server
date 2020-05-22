require('dotenv').config();
const mocha = require('mocha');
const { expect } = require('chai');
const supertest = require('supertest');
const SessionsService = require('../../src/sessions/sessions-service.js');
const knex = require('knex');
const app = require('../../src/app')

mocha.describe(`Sessions service object`, () => {
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
    let session1Id, session2Id;
    let session1End, session2End;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        });

        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('clean the tables before ', () => db.raw('TRUNCATE TABLE users, pomodoro_sessions RESTART IDENTITY CASCADE'));

    afterEach('clean the tables afterEach', () =>  db.raw('TRUNCATE TABLE users, pomodoro_sessions RESTART IDENTITY CASCADE'));

    context(`Given 'pomodoro_sessions' has data`, () => {
        // populate users for owner_id FK on pomodoro_sessions
        beforeEach(() => {
            return db
                .into('users')
                .insert(testUsers)
                .returning('id')
                .then((res) => {
                    user1Id = res[0];
                    user2Id = res[1];
                    return db.into('pomodoro_sessions')
                        .insert([
                            {
                                session_owner: user1Id,
                                session_name: 'First test session!',
                                session_description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?'
                            },
                            {
                                session_owner: user2Id,
                                session_name: 'second test session!',
                                session_description: 'content for session 2'
                            }
                        ])
                        .returning('*')
                        .then(res => {
                            session1Id = res[0].id;
                            session2Id = res[1].id;
                            session1End = res[0].session_end;
                            session2End = res[1].session_end;
                        });
                })
        });

        it(`getAllSessions() resolves all pomodoro_sessions from 'pomodoro_sessions table`, () => {
            return SessionsService.getAllSessions(db)
                .then(actual => {
                    expect(actual).to.eql([
                        {
                            id: session1Id,
                            session_owner: user1Id,
                            session_name: 'First test session!',
                            session_description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
                            session_end: session1End,
                        },
                        {
                            id: session2Id,
                            session_owner: user2Id,
                            session_name: 'second test session!',
                            session_description: 'content for session 2',
                            session_end: session2End,
                        }
                    ]);
                });
        });

        it(`getSessionsByOwnerId() resolves a Sessions by an owner_id from 'pomodoro_sessions' table`, () => {
            return SessionsService.getSessionsByOwnerId(db, user2Id)
                .then(actual => {
                    expect(actual).to.eql([{
                        id: session2Id,
                        session_name: 'second test session!',
                        session_description: 'content for session 2',
                        session_owner: user2Id,
                        session_end: session2End,
                    }]);
                });
        });

        it(`deleteSession() removes an Session by id from 'pomodoro_sessions' table`, () => {
            return SessionsService.deleteSession(db, session2Id)
                .then(() => SessionsService.getAllSessions(db))
                .then(allSessions => {
                    // copy the test pomodoro_sessions array without the "deleted" Session
                    const expected = [{
                        id: session1Id,
                        session_owner: user1Id,
                        session_name: 'First test session!',
                        session_description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
                        session_end: session1End,
                    }];
                    expect(allSessions).to.eql(expected);
                });
        });

    });

    context(`Given 'pomodoro_sessions' has no data`, () => {

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

        it(`getAllSessions() resolves an empty array`, () => {
            return SessionsService.getAllSessions(db)
                .then(actual => {
                    expect(actual).to.eql([])
                });
        });

        it(`insertSession() inserts a new Session and resolves a new Session with an 'id'`, (() => {
            const newSession = {
                session_name: 'Test new session_name',
                session_description: 'Test new session_description',
                ownerId: user1Id,
            }
            let postedDate;

            return SessionsService.insertSession(db, newSession)
                .then(res => {
                    postedDate = res.session_end;
                    return res;
                })
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        session_end: postedDate,
                        session_name: newSession.session_name,
                        session_description: newSession.session_description,
                        session_owner: user1Id,
                    });
                });
        }));
    });
});