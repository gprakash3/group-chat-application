const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');
const app = express();
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const {CronJob} = require('cron');

//importing tables
const User = require('./model/user');
const Message = require('./model/message');
const Group = require('./model/group');
const UserGroup = require('./model/usergroup');
const AdminGroup = require('./model/adminofgroup');
const CommonMessage = require('./model/commongroupmessage');
const ArchiveMessage= require('./model/archivemessage');
const ArchiveCommonMessage= require('./model/archivecommongroup');

const cors = require('cors');
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE"]
}));

require('dotenv').config()

app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/static", express.static('./static/'));

//importing routes
const userDataRoute = require('./routes/userdata');
const chatRoute = require('./routes/chat');
const imguploadRoute = require('./routes/imageshare');

app.use(userDataRoute);
app.use(chatRoute);
app.use(imguploadRoute);
app.use((req, res) => {
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




//app.js
const socketio = require('./socket.js');

//after creating your server etc
const io = socketio.getIo(server);

sequelize.sync()
    // sequelize.sync({alter:true})
    .then(result => {
        const dataMoveJob = new CronJob('0 0 * * *', async () => {
            try {
                const data1 = await Message.findAll();
                await ArchiveMessage.bulkCreate(data1);
                const data2 = await CommonMessage.findAll();
                await ArchiveCommonMessage.bulkCreate(data2);
                console.log('Data moved successfully.');
            } catch (error) {
                console.error('Error moving data:', error);
            }
        });

        console.log('app started');
        server.listen(3000);
    })
    .catch(err => console.log(err));