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
const AdminGroup= require('./model/adminofgroup');
const CommonMessage=require('./model/commongroupmessage');

const cors = require('cors');
app.use(cors({origin:"*",
methods:["GET", "POST", "DELETE"]
}));
require('dotenv').config()

app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/static", express.static('./static/'));

const userDataRoute=require('./routes/userdata');
const chatRoute=require('./routes/chat');

app.use(userDataRoute);
app.use(chatRoute);
app.use((req,res) => {
    res.sendFile(path.join(__dirname, `public/login.html`));
})

User.hasMany(Message);
Message.belongsTo(User);

User.hasMany(CommonMessage);
CommonMessage.belongsTo(User);

Group.hasMany(Message);
Message.belongsTo(Group);

Group.belongsToMany(User, { through: UserGroup });
User.belongsToMany(Group, { through: UserGroup });

User.belongsToMany(Group, {through:AdminGroup});
Group.belongsToMany(User, {through:AdminGroup});



sequelize.sync()
    // sequelize.sync({alter:true})
    .then(result => {
        console.log('app started');
        app.listen(3000);
    })
    .catch(err => console.log(err));