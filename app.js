const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');
const app = express();
const path = require('path');

const User=require('./model/user');
const Message=require('./model/message');
const Group=require('./model/group');
const UserGroup=require('./model/usergroup');

const cors = require('cors');
app.use(cors({origin:"*",
methods:["GET", "POST", "DELETE"]
}));
require('dotenv').config()

app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const userDataRoute=require('./routes/userdata');
const chatRoute=require('./routes/chat');

app.use(userDataRoute);
app.use(chatRoute);

User.hasMany(Message);
Message.belongsTo(User);

Group.hasMany(Message);
Message.belongsTo(Group);

Group.belongsToMany(User, { through: UserGroup });
User.belongsToMany(Group, { through: UserGroup });

sequelize.sync()
    // sequelize.sync({alter:true})
    .then(result => {
        console.log('app started');
        app.listen(5000);
    })
    .catch(err => console.log(err));