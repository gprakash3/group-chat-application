const express = require('express');

const bodyParser = require('body-parser');
const sequelize = require('./util/database');
const app = express();
const path = require('path');

const http = require('http');        //new
const server = http.createServer(app); //new

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
const imguploadRoute= require('./routes/imageshare');

app.use(userDataRoute);
app.use(chatRoute);
app.use(imguploadRoute);
// app.use((req,res) => {
//     res.sendFile(path.join(__dirname, `public/login.html`));
// })

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

//app.js
const socketio = require('./socket.js');

//after creating your server etc
const io = socketio.getIo(server);

sequelize.sync()
    // sequelize.sync({alter:true})
    .then(result => {
        console.log('app started');
        server.listen(8080);
    })
    .catch(err => console.log(err));