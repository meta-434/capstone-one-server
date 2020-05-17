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

//set secret
app.set('Secret', config.SECRET_KEY);

// helmet
app.use(helmet());

// cors
app.use(cors({credentials: true, origin: 'http://localhost:4200'}));

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

app.post('/authenticate',(req,res)=>{
    if(req.body.username==="testuser"){
        if(req.body.password==="123"){
            //if eveything is okey let's create our token
            const payload = {
                check:  true
            };

            let token = jwt.sign(payload, app.get('Secret'), {
                expiresIn: 1440 // expires in 24 hours
            });

            // return the informations to the client
            res.json({
                message: 'authentication done ',
                token: token
            });

        }else{
            res.json({message:"please check your password !"})
        }

    }else{
        res.json({message:"user not found !"})
    }
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