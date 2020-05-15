const express = require('express');

const authRouter = express.Router();
const jsonParser = express.json();

authRouter
.route('/');