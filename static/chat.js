
var currentgroupId = localStorage.getItem('currentGroupId');
var currentUserId = localStorage.getItem('currentUserId');
var currentUserName = localStorage.getItem('currenetUserName');
var token = localStorage.getItem('token');
var indexOfMsgSaved = 0;
var previousId;
const display = document.getElementById('messageDisplay');
const errordisplay = document.getElementById('errordisplay');

var socket = io();

socket.on('connect', async () => {
    //adding to all groups of which user is part of
    let rooms = [];
    const resp = await axios.get(`http:// 65.1.112.255:3000/getAllUserGroup`, { headers: { "Authorization": token } });
    for (let i = 0; i < resp.data.groupdata.length; i++) {
        rooms.push(resp.data.groupdata[i].id);
    }
    socket.emit('join-room', rooms);
    socket.emit('join-room', localStorage.getItem('currentGroupId'));
    console.log('joined these rooms', rooms);
})

if (currentgroupId == 0) {
    socket.on('receive-message-commongroup', message => {
        appendmessage(message);
    });
}

socket.on('receive-message-particulargroup', data => {
    if (data.groupid == currentgroupId) { appendmessage(data.msg); }
});

//when user get added to group
socket.on('user_added', message => {
    console.log(message.userID, currentUserId);
    displaysystemmessage(`${message.addername} added ${message.userName}`);
})
// as group name will not be available on screen when we get added hence message broadcast to us will not reached.
socket.on('updateGroupTileonAdd', async (message) => {
    console.log(message);
    await updategrouptile();
    document.getElementById(`${localStorage.getItem('currentGroupId')}`).style.backgroundColor = "aqua";
})
//update tiles of all user if user get added or deleted from group
socket.on('updategrouptileonremove', async (message) => {
    console.log(message);
    await updategrouptile();
    document.getElementById(`${localStorage.getItem('currentGroupId')}`).style.backgroundColor = "aqua";
})

//since user is removed, move user page to common group
socket.on('user_remove', async (message) => {
    console.log("removed from group chat.js", message.userID, currentUserId);
    if (message.userID == currentUserId) {
        console.log("removed from group chat.js", message.userID, currentUserId);
        // displaysystemmessage(`${message.addername} removed you`);
        await updategrouptile();
        await checkgroupmembership();
        await updatechatonscreen(localStorage.getItem('currentGroupId'));
        await facilitiesforadmin(localStorage.getItem('currentGroupId'));
        document.getElementById('0').style.backgroundColor = "aqua";
        return;
    }
    displaysystemmessage(`${message.addername} removed ${message.userName}`);
})

async function displaysystemmessage(message) {
    try {
        const div = document.createElement('div');
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(message));
        div.appendChild(li);
        div.className = "systemmessage";
        display.appendChild(div);
    }
    catch (err) {
        console.log(err);
    }
}

async function appendmessage(message) {
    //checking if message contain image link 
    const indexOfColon = message.indexOf(':');
    let part1;
    let part2;
    if (indexOfColon !== -1) {
        part1 = message.substring(0, indexOfColon);
        part2 = message.substring(indexOfColon + 1);
    }

    if (part2!=undefined && part2.includes("PDF") && part2.includes("https")) {
        appendmessage(`${part1} shared file:`);
        appendpdf(part2);
        return;
    }
    else if(part2!=undefined && part2.includes("VID") && part2.includes("https")){
         appendmessage(`${part1} shared video:`);
        appendVid(part2);
        return;
    }
    else if(part2!=undefined && part2.includes("IMG") && part2.includes("https")){
        appendmessage(`${part1} shared Image:`);
        appendImg(part2);
        return;
    }
    const div = document.createElement('div');
    const li = document.createElement('li');
    li.appendChild(document.createTextNode(message));
    div.appendChild(li);
    display.appendChild(div);
}

async function appendImg(obj) {
    const div = document.createElement('div');
    const img = document.createElement('img');
    img.className = "image";
    img.src = `${obj}`;
    const downloadButton = document.createElement('a');
    downloadButton.href = `${obj}`;
    downloadButton.appendChild(document.createTextNode('Download Image'));
    div.appendChild(img);
    div.appendChild(downloadButton);
    display.appendChild(div);
}

async function appendVid(obj) {
    const div = document.createElement('div');
    const video = document.createElement('video');
    video.className= 'video';
    video.controls = true;
    var source = document.createElement('source');
    source.src = `${obj}`;
    source.type = 'video/mp4';
    video.appendChild(source);
    div.appendChild(video);
    display.appendChild(div);
}

async function appendpdf(obj) {
    let urlfilename= obj.split('PDF/');
    let file_name = urlfilename[1].replace(/%20/g, ' ');
    const div = document.createElement('div');
    const text = document.createTextNode('Click here to download pdf:')
    div.appendChild(text);
    div.innerHTML+=`<a  href=${obj}>${file_name}</a>`;
    display.appendChild(div);
}

const imgsharebtn = document.getElementById('sendimgbtn');
imgsharebtn.addEventListener('click', async (e) => {
    try {
        e.preventDefault();
        console.log('clicked');
        const fileInput = document.getElementById('uploadfile');
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post(`http:// 65.1.112.255:3000/uploadtos3`, formData);
        fileInput.value = '';
        console.log(res.data.fileUrl);
        await appendmessage(`${currentUserName}:${res.data.fileUrl}`);
        const resp = await axios.post(`http:// 65.1.112.255:3000/sendMessage`, { msg: res.data.fileUrl, groupid: currentgroupId }, { headers: { "Authorization": token } });
        console.log(resp.data);

        document.getElementById('messages').value = '';
        if (currentgroupId == 0) {
            socket.emit('send-message-commongroup', `${currentUserName} share image:${res.data.fileUrl}`);
        }
        else {
            const obj = { msg: `${currentUserName}:${res.data.fileUrl}`, groupid: currentgroupId }
            socket.emit('send-message-particulargroup', obj, currentgroupId);
        }
    }
    catch (err) {
        console.log(err);
        console.log(err.message);
    }
})

const submitbtn = document.getElementById('sendbtn');
submitbtn.addEventListener('click', async (e) => {
    try {
        e.preventDefault();
        const msg1 = document.getElementById('messages').value;
        let currentgroupId = localStorage.getItem('currentGroupId') | 0;
        let currentUserName = localStorage.getItem('currenetUserName');
        const res = await axios.post(`http:// 65.1.112.255:3000/sendMessage`, { msg: msg1, groupid: currentgroupId }, { headers: { "Authorization": token } });
        appendmessage(`${currentUserName}:${msg1}`);
        document.getElementById('messages').value = '';
        if (currentgroupId == 0) {
            socket.emit('send-message-commongroup', `${currentUserName}:${msg1}`);
        }
        else {
            const obj = { msg: `${currentUserName}:${msg1}`, groupid: currentgroupId }
            socket.emit('send-message-particulargroup', obj, currentgroupId);
        }
    }
    catch (err) {
        console.log(err);
        errordisplay.innerHTML = `something went wrong - ${err}`;
    }
});

//update groupnames on tile if user is added or get removed from group
async function updategrouptile() {
    try {
        const res = await axios.get(`http:// 65.1.112.255:3000/getAllUserGroup`, { headers: { "Authorization": token } });
        console.log(res.data.groupdata);
        const groupnames = document.getElementById('groupnames');
        groupnames.innerHTML = '';
        let obj = { id: 0, groupname: "Common Group", createdby: '' };
        await showGroupNameontile(obj);
        for (let i = 0; i < res.data.groupdata.length; i++) {
            await showGroupNameontile(res.data.groupdata[i]);
        }
        let string = JSON.stringify(res.data.groupdata);
        localStorage.setItem('lastgroupdata', string);
    }
    catch (err) {
        console.log(err);
        errordisplay.innerHTML = `something went wrong - ${err}`;
    }
}

async function checkgroupmembership() {
    try {
        const groupid = localStorage.getItem('currentGroupId');
        const res = await axios.post(`http:// 65.1.112.255:3000/checkgroupmembership`, { groupid: groupid }, { headers: { "Authorization": token } });
        console.log(res.data);
        if (!res.data.isMember) {
            localStorage.setItem('currentGroupId', 0);
        }
    }
    catch (err) {
        console.log(err);
        errordisplay.innerHTML = 'something went wrong ' + `${err.message}`;
    }
}

//function when page is refreshed
window.addEventListener('DOMContentLoaded', async (e) => {
    await actiononreloadpage();
});

async function actiononreloadpage() {
    try {
        await checkgroupmembership();
        await displayAllGroup();
        currentgroupId = localStorage.getItem('currentGroupId') | 0;
        const res = await axios.get(`http:// 65.1.112.255:3000/getCurrentUser`, { headers: { "Authorization": token } })
        console.log(res.data.currentuser);
        currentUserId = res.data.currentuserid;
        const currentuser = document.getElementById('currentuser');
        currentuser.appendChild(document.createTextNode(`User Logged In: ${res.data.currentuser}`));
        await savemessagetoLS();
        await facilitiesforadmin(currentgroupId);
        if (currentgroupId === 0 || currentgroupId == undefined || currentgroupId == null) {
            document.getElementById('0').style.backgroundColor = "aqua";
            document.getElementById('isUserAdmin').innerHTML = 'Admin functionality is not applicable in this group';
        }
        else {
            document.getElementById(`${currentgroupId}`).style.backgroundColor = "aqua";
        }

    }
    catch (err) {
        console.log(err);
    }
}

async function savemessagetoLS() {
    try {
        let messages = [];
        //To find latest message, calculating ID from where we should read messages so that we get last 15 message at most.
        let indexOfMsgSaved = localStorage.getItem(`${currentgroupId}messagecount`) | 0;
        var startingFilterIndex = (indexOfMsgSaved - 15) > 0 ? indexOfMsgSaved - 15 : 0;
        const res = await axios.post(`http:// 65.1.112.255:3000/getGroupMessage?start=${startingFilterIndex}`, { groupid: currentgroupId });
        //storing highest ID that we received.
        if (res.data.message.length == 0) {
            display.innerHTML = 'No message';
            return;
        };
        //To get number of message that is stored in database
        indexOfMsgSaved = res.data.message[res.data.message.length - 1].dataValues.id;
        localStorage.setItem(`${currentgroupId}messagecount`, indexOfMsgSaved);
        display.innerHTML = '';

        //getting last 15 latest message starting index
        const startingidx = (res.data.message.length - 15) > 0 ? res.data.message.length - 15 : 0;
        //push 15 latest message to array messages
        for (let i = startingidx; i < res.data.message.length; i++) {
            messages.push(res.data.message[i].name + ':' + res.data.message[i].dataValues.message);
        }
        //stringify array
        let string = JSON.stringify(messages);
        //storing latest 15 message in form of array in local storage
        localStorage.setItem(`${currentgroupId}`, string);

        //reading message from localstorage and display on screen
        updatechatonscreen(currentgroupId);
    }
    catch (err) {
        console.log(err);
        errordisplay.innerHTML = `something went wrong - ${err}`;
    }
}

async function updatechatonscreen(groupid) {
    try {
        // Retrieving the string
        let retString = localStorage.getItem(`${groupid}`)
        // Retrieved array
        let retArray = JSON.parse(retString)
        //cleaning the screen so that message donot repeat
        display.innerHTML = '';
        //displaying message on screen which is read from localstorage
        for (let i = 0; i < retArray.length; i++) {
            // display.innerHTML += retArray[i] + `<br>`;
            appendmessage(retArray[i]);
        }
    }
    catch (err) {
        console.log(err);
        errordisplay.innerHTML = `something went wrong - ${err}`;
    }
}

//create new group
const createnewgroup = document.getElementById('createnewgroup');
createnewgroup.addEventListener('click', async (e) => {
    e.preventDefault();
    const entergroupname = document.getElementById('entergroupname');
    entergroupname.classList.toggle('show');
    const groupnamesbmtbtn = document.getElementById('groupnamesbmtbtn');
    groupnamesbmtbtn.addEventListener('click', async (e) => {
        e.preventDefault();
        entergroupname.style.display = 'none';
        const groupName = document.getElementById('groupname').value;
        const resp = await axios.post(`http:// 65.1.112.255:3000/createGroup`, { groupname: groupName }, { headers: { "Authorization": token } });
        console.log(resp.data.response.id);
        const res = await axios.get(`http:// 65.1.112.255:3000/getAllUser`);
        console.log(res.data.user);
        const showAllUser = document.getElementById('showAllUser');
        showAllUser.classList.toggle('show');
        showAllUserOnTile(res.data.user, resp.data.response.id);
    })

});
//show user when clicked on createGroup button.
async function showAllUserOnTile(obj, groupID) {
    try {
        const showAllUser = document.getElementById('showAllUser');
        for (let i = 0; i < obj.length; i++) {
            if (obj[i].id === currentUserId) {
                continue;
            }
            const div = document.createElement('div');
            const li = document.createElement('li');
            li.appendChild(document.createTextNode(obj[i].name));
            var newCheckBox = document.createElement('input');
            newCheckBox.type = 'checkbox';
            newCheckBox.name = 'user';
            newCheckBox.id = `${obj[i].id}`;
            li.appendChild(newCheckBox);
            div.appendChild(li);
            showAllUser.appendChild(div);

        }
        const addUser = document.createElement('button');
        addUser.innerHTML = 'Add user';
        showAllUser.appendChild(addUser);

        addUser.addEventListener('click', async (e) => {
            e.preventDefault();
            var checkboxes =
                document.getElementsByName('user');
            let ids = [];
            for (var i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked) {
                    ids.push(checkboxes[i].id);
                }
            }
            const res = await axios.post(`http:// 65.1.112.255:3000/addUsersToGroup`, { ids: ids, groupid: groupID }, { headers: { "Authorization": token } })
            alert('group created');
            socket.emit('new group created', 'group created');
            location.reload();
        })
    }
    catch (err) {
        console.log(err);
    }
}

//display all group with currentUser as member on left tiles
async function displayAllGroup() {
    try {
        const res = await axios.get(`http:// 65.1.112.255:3000/getAllUserGroup`, { headers: { "Authorization": token } });
        console.log(res.data.groupdata);
        let obj = { id: 0, groupname: "Common Group", createdby: '' };
        showGroupNameontile(obj);
        for (let i = 0; i < res.data.groupdata.length; i++) {
            showGroupNameontile(res.data.groupdata[i]);
        }
        let string = JSON.stringify(res.data.groupdata);
        localStorage.setItem('lastgroupdata', string);
    }
    catch (err) {
        console.log(err);
        errordisplay.innerHTML = `something went wrong - ${err}`;
    }
}

//show Group name on left tile
async function showGroupNameontile(obj) {
    try {
        const groupnames = document.getElementById('groupnames');

        const div = document.createElement('div');
        div.id = `${obj.id}`;
        div.classList = 'groupnametile';
        div.style = "border: 1px solid black";
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(obj.groupname));

        div.appendChild(li);
        groupnames.appendChild(div);


        div.addEventListener('click', async (e) => {
            e.preventDefault();
            const managegroup = document.getElementById('managegroup');
            currentgroupId = div.id | '0';
            previousId = localStorage.getItem('currentGroupId') | 0;
            document.getElementById(`${previousId}`).style.backgroundColor = 'white';
            localStorage.setItem("currentGroupId", obj.id);
            document.getElementById(`${currentgroupId}`).style.backgroundColor = "aqua";

            // //adding to socket room
            socket.emit('join-room', localStorage.getItem('currentGroupId'));

            //adding group name and Group creator name
            document.getElementById('GroupNamenav').innerHTML = obj.groupname;
            if (currentgroupId == 0) {
                document.getElementById('createdBynav').innerHTML = '';

            } else {
                document.getElementById('createdBynav').innerHTML = "created By: " + obj.createdby;
            }
            await facilitiesforadmin(obj.id);
            await savemessagetoLS();
        })
    }
    catch (err) {
        errordisplay.innerHTML = `something went wrong -  ${err.message}`;
    }
}

// //admin functionalities based on user
async function facilitiesforadmin(groupid) {
    try {
        const res = await axios.post(`http:// 65.1.112.255:3000/checkUserIsAdmin`, { groupid: groupid }, { headers: { "Authorization": token } });

        if (res.data.isAdmin) {
            document.getElementById("searchuserbtn").disabled = false;
            document.getElementById("addusertogroupbtn").disabled = false;
            document.getElementById('removeuserfromgroupbtn').disabled = false;
            document.getElementById('isUserAdmin').innerHTML = "";
        }
        else {
            document.getElementById('isUserAdmin').innerHTML = 'You are not admin for this group' + `<hr>`;
            if (localStorage.getItem('currentGroupId') == 0) { document.getElementById('isUserAdmin').innerHTML = 'Admin functionality is not applicable in this group'; }
            document.getElementById("searchuserbtn").disabled = true;
            document.getElementById("addusertogroupbtn").disabled = true;
            document.getElementById('removeuserfromgroupbtn').disabled = true;
        }
    }
    catch (err) {
        errordisplay.innerHTML = `something went wrong -  ${err.message}`;
    }
}

// //admin functionalities
// //find user then add to group if not memeber of group
const addusertogroupbtn = document.getElementById('addusertogroupbtn');
addusertogroupbtn.addEventListener('click', async (e) => {
    try {
        e.preventDefault();
        const data = document.getElementById('searchuser').value;
        const filtername = document.getElementById('searchuserfilter').value;
        const groupId = localStorage.getItem('currentGroupId');
        const res = await axios.post(`http:// 65.1.112.255:3000/getUsertoaddingroupAdmin`, { groupid: groupId, filtername: filtername, data: data });
        if (!res.data) {
            alert('user not found');
        }
        const display = document.getElementById('displayusertoaddingroup');
        display.innerHTML = '';
        console.log(res.data.userdata[0]);
        for (let i = 0; i < res.data.userdata.length; i++) {
            await showUserforAdminonScreen(res.data.userdata[i], groupId);
        }

    }
    catch (err) {
        console.log(err);
        errordisplay.innerHTML = `something went wrong -  ${err.message}`;
        alert(err.response.data.error);
    }
})

// //show user to add in group by Admin
async function showUserforAdminonScreen(obj, groupid) {
    try {
        const display = document.getElementById('displayusertoaddingroup');

        const div = document.createElement('div');
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(obj.name));
        li.appendChild(document.createTextNode('-'));
        li.appendChild(document.createTextNode(obj.phone));

        const btn = document.createElement('button');
        btn.innerHTML = 'Add User';
        li.appendChild(btn);
        div.appendChild(li);
        display.appendChild(div);
        btn.addEventListener('click', async (ev) => {
            try {
                ev.preventDefault();
                const res = await axios.post(`http:// 65.1.112.255:3000/AddusertogroupAdmin`, { id: obj.id, groupid: groupid });
                console.log(res.data);
                alert('user successfully added to group');
                div.removeChild(li);

                //sending event to socket if user is added to group
                let groupuserdata = { userID: obj.id, userName: obj.name, addername: currentUserName, groupid: groupid }
                socket.emit('user-added-in-group', groupuserdata, `${groupid}`);

            }
            catch (err) {
                console.log(err);
                errordisplay.innerHTML = `something went wrong -  ${err.message}`;
                alert(err.response.data.error);
            }
        })
    }
    catch (err) {
        console.log(err);
        errordisplay.innerHTML = `something went wrong -  ${err.message}`;
        alert(err.response.data.error);
    }
}


// //To make existing user group admin
const searchuserbtn = document.getElementById('searchuserbtn');
searchuserbtn.addEventListener('click', async (e) => {
    try {
        e.preventDefault();
        const display = document.getElementById('displayusertomakeadmin');
        const groupid = localStorage.getItem('currentGroupId');
        const res = await axios.post(`http:// 65.1.112.255:3000/getAllUserforAdmin`, { groupid: groupid });
        display.innerHTML = '';
        if (res.data.userdata.length === 0) { errordisplay.innerHTML = `No more user to make admin of group - All user are admin`; }
        for (let i = 0; i < res.data.userdata.length; i++) {

            const div = document.createElement('div');
            const li = document.createElement('li');
            li.appendChild(document.createTextNode(res.data.userdata[i].name));
            li.appendChild(document.createTextNode('-'));
            li.appendChild(document.createTextNode(res.data.userdata[i].phone));

            const btn = document.createElement('button');
            btn.innerHTML = 'Make Admin';
            li.appendChild(btn);
            div.appendChild(li);
            display.appendChild(div);
            btn.addEventListener('click', async (ev) => {
                try {
                    ev.preventDefault();
                    const resp = await axios.post(`http:// 65.1.112.255:3000/makeGroupAdmin`, { id: res.data.userdata[i].id, groupid: groupid }, { headers: { "Authorization": token } });
                    errordisplay.innerHTML = `${res.data.userdata[i].name} made Admin of Group`;
                    div.removeChild(li);
                    console.log(resp.data);
                }
                catch (err) {
                    console.log(err);
                    errordisplay.innerHTML = `something went wrong -  ${err.message}`;
                    alert(err.response.data.error);
                }
            })
        }
    }
    catch (err) {
        console.log(err);
        errordisplay.innerHTML = `something went wrong -  ${err.message}`;
        alert(err.response.data.error);
    }
});

//remove user from group
const removeuserfromgroupbtn = document.getElementById('removeuserfromgroupbtn');
removeuserfromgroupbtn.addEventListener('click', async (e) => {
    try {
        e.preventDefault();
        let groupid = localStorage.getItem('currentGroupId');
        const display = document.getElementById('displayUserToBeremovedfromGroup');
        display.innerHTML = '';
        const res = await axios.post(`http:// 65.1.112.255:3000/getAllUserOfGroup`, { groupid: groupid }, { headers: { "Authorization": token } });
        console.log(res.data);
        for (let i = 0; i < res.data.userdata.length; i++) {
            const div = document.createElement('div');
            const li = document.createElement('li');
            li.appendChild(document.createTextNode(res.data.userdata[i].name));
            li.appendChild(document.createTextNode('-'));
            li.appendChild(document.createTextNode(res.data.userdata[i].phone));
            const removebtn = document.createElement('button');
            removebtn.innerHTML = 'remove';
            li.appendChild(removebtn);
            div.appendChild(li);
            display.appendChild(div);
            removebtn.addEventListener('click', async (ev) => {
                try {
                    ev.preventDefault();
                    const resp = await axios.post(`http:// 65.1.112.255:3000/removeUserFromGroup`, { groupid: groupid, userid: res.data.userdata[i].id });
                    alert('user successfully removed from group');
                    console.log(resp.data);
                    //sending socket event
                    let groupuserdata = { userID: res.data.userdata[i].id, userName: res.data.userdata[i].name, addername: currentUserName, groupid: groupid }
                    socket.emit('user-remove-from-group', groupuserdata, `${groupid}`);
                    div.removeChild(li);
                }
                catch (err) {
                    console.log(err);
                    errordisplay.innerHTML = 'something went wrong' + `${err.message}`
                }
            })

        }
    }
    catch (err) {
        console.log(err);
        errordisplay.innerHTML = `something went wrong -  ${err.message}`;
    }
})








