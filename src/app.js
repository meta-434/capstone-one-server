require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const config = require('./config');
const xss = require('xss');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const sessionsRouter = require('./sessions/sessions-router');
const notesRouter = require('./notes/notes-router');
const AuthService = require('./auth-service');

const app = express();

//set secret
app.set('Secret', config.SECRET_KEY);

// helmet
app.use(helmet());

// cors
app.use(cors({credentials: true}));

// use morgan to log requests to the console
app.use(morgan('dev'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

// define router
const  ProtectedRoutes = express.Router();

app.use('/api', ProtectedRoutes);
ProtectedRoutes.use((req, res, next) =>{
    // check header or url parameters or post parameters for token
    let token = req.headers['access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, app.get('Secret'), (err, decoded) =>{
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token, return an error
        return res.status(403).send({
            message: 'No token provided.'
        });
    }
});

// on successful authentication, return jwt to client for future access
app.post('/authenticate',(req,res,next)=>{
    const knexInstance = req.app.get('db');
    AuthService.getAllUsers(knexInstance)
        .then(users => {
            return users;
        })
        .then(result => {
            const foundUsers = result.filter((el) => {
                return (
                  el.username === req.body.username &&
                      el.password === req.body.password
                );
            });
            // if there are any users that match...
            if (foundUsers.length > 0) {
                //if everything is ok, proceed to create token
                const payload = {
                    check:  true,
                    username: foundUsers[0].username,
                    password: foundUsers[0].password,
                    id: foundUsers[0].id,
                    is_admin: foundUsers[0].admin,
                };

                let token = jwt.sign(payload, app.get('Secret'), {
                    expiresIn: 1440 // expires in 24 hours
                });

                // return the information to the client
                res
                    .json({
                    message: 'authentication complete.',
                    token: token
                    })
                    .status(202)
            } else {
                res
                    .json({message: "username or password incorrect"})
                    .status(403);
            }
        })
        .catch(next);
})

// handle new user submissions
app.patch('/authenticate', (req, res, next) => {
    const {username, password} = req.body;
    const knexInstance = req.app.get('db');

    AuthService
        .getAllUsers(knexInstance)
        .then(res => {
            return resFiltered = res.filter((usr) => (username === usr.username))
        })
        .then(filterRes => {
            if (filterRes.length > 0) {
                res.json({
                    message: 'user already exists'
                })
                    .status(401);
            } else {
                AuthService.insertUser(knexInstance, {username, password})
                    .then(result => {
                        res.json({
                            message: 'signup complete'
                        })
                            .status(202);
                    })
                    .catch(error => console.error(error))
            }
        });
})

// point to other endpoint routers
ProtectedRoutes.use('/notes', notesRouter);
ProtectedRoutes.use('/sessions', sessionsRouter);

// '/' catcher
app.get('/', function(req, res) {
    res.send(`Hello world! app is running on ${config.PORT}`);
});

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