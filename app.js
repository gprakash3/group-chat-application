const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');
const app = express();
const path = require('path');

const cors = require('cors');
app.use(cors());
require('dotenv').config()

app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const userDataRoute=require('./routes/userdata');

app.use(userDataRoute);

sequelize.sync()
    // sequelize.sync({force:true})
    .then(result => {
        console.log('app started');
        app.listen(5000);
    })
    .catch(err => console.log(err));