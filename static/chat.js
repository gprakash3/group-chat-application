
let currentuser;
let currentUserId;
const token = localStorage.getItem('token');
var indexOfMsgSaved = 0;
const display = document.getElementById('messageDisplay');
const errordisplay = document.getElementById('errordisplay');
const submitbtn = document.getElementById('sendbtn');

submitbtn.addEventListener('click', async (e) => {
    try {
        e.preventDefault();
        const msg1 = document.getElementById('messages').value;
        currentgroupId = localStorage.getItem('currentGroupId') | 0;
        const res = await axios.post('http://localhost:5000/sendMessage', { msg: msg1, groupid: currentgroupId }, { headers: { "Authorization": token } });
        console.log(res.data);
        await makechatrealtime();
    }
    catch (err) {
        console.log(err);
        errordisplay.innerHTML = `something went wrong - ${err}`;
    }
});

// calling API repeatedly
setInterval(makechatrealtime, 500);
setInterval(updategrouptile, 10999);
setInterval(checkgroupmembership, 10999);

async function updategrouptile() {

    try {
        var flag = false;
        let previousgroups = localStorage.getItem('lastgroupdata');
        let retArray = JSON.parse(previousgroups)
        const res = await axios.get('http://localhost:5000/getAllUserGroup', { headers: { "Authorization": token } });

        if (retArray.length !== res.data.groupdata.length) {
            console.log(res.data.groupdata);
            const groupnames = document.getElementById('groupnames');
            groupnames.innerHTML = '';
            obj = { id: 0, groupname: "Common Group", createdby: '' };
            showGroupNameontile(obj);
            for (let i = 0; i < res.data.groupdata.length; i++) {
                showGroupNameontile(res.data.groupdata[i]);
            }

            let string = JSON.stringify(res.data.groupdata);
            localStorage.setItem('lastgroupdata', string);
        }

        for (let j = 0; j < res.data.groupdata.length; j++) {
            if (retArray[j].id != res.data.groupdata[j].id) {
                console.log(retArray[j].id, res.data.groupdata[i].id);
                flag = true;
            }
        }

        if (flag) {
            console.log(res.data.groupdata);
            const groupnames = document.getElementById('groupnames');
            groupnames.innerHTML = '';
            obj = { id: 0, groupname: "Common Group", createdby: '' };
            showGroupNameontile(obj);
            for (let i = 0; i < res.data.groupdata.length; i++) {
                showGroupNameontile(res.data.groupdata[i]);
            }

            let string = JSON.stringify(res.data.groupdata);
            localStorage.setItem('lastgroupdata', string);
        }
    }
    catch (err) {
        console.log(err);
        errordisplay.innerHTML = `something went wrong - ${err}`;
    }
}

async function checkgroupmembership(){
    try{
        const groupid= localStorage.getItem('currentGroupId');
        const res= await axios.post('http://localhost:5000/checkgroupmembership', {groupid:groupid},{ headers: { "Authorization": token } } );
        console.log(res.data);
        if(!res.data.isMember){
            localStorage.setItem('currentGroupId', 0);
        }
    }
    catch(err){
        console.log(err);
        errordisplay.innerHTML='something went wrong '+ `${err.message}`;
    }
}

//function to make chat realtime
async function makechatrealtime() {
    try {
        currentId = localStorage.getItem('currentGroupId') | 0;
        if (currentId == 0) {
            savemessagetoLS();
        }
        else {
            const resp = await axios.post('http://localhost:5000/getParticularGroupMessage', { groupId: currentId });
            //cleaning the screen so that message donot repeat
            display.innerHTML = '';
            //displaying message on screen received from database
            for (let i = 0; i < resp.data.message.length; i++) {
                display.innerHTML += resp.data.message[i].name + ':' + resp.data.message[i].dataValues.message + `<br>`;
            }
        }
    }
    catch (err) {
        console.log(err);
        errordisplay.innerHTML = `something went wrong - ${err}`;
    }
}



//function when page is refreshed
window.addEventListener('DOMContentLoaded', async (e) => {
    await checkgroupmembership();
    await displayAllGroup();
    currentId = localStorage.getItem('currentGroupId') | 0;
    const res = await axios.get('http://localhost:5000/getCurrentUser', { headers: { "Authorization": token } })
    console.log(res.data.currentuser);
    currentUserId = res.data.currentuserid;
    const currentuser = document.getElementById('currentuser');
    currentuser.appendChild(document.createTextNode(`User Logged In: ${res.data.currentuser}`));
    if (currentId === 0) {
        savemessagetoLS();
    }
    else {
        await getParticularGroupMessage();
    }
    await facilitiesforadmin(currentId);
    if (currentId === 0 || currentId == undefined || currentId == null) {
        document.getElementById('0').style.backgroundColor = "aqua";
    }
    else {
        document.getElementById(`${currentId}`).style.backgroundColor = "aqua";
    }

});

async function getParticularGroupMessage() {
    try {
        currentId = localStorage.getItem('currentGroupId') | 0;
        const resp = await axios.post('http://localhost:5000/getParticularGroupMessage', { groupId: currentId });
        //cleaning the screen so that message donot repeat
        display.innerHTML = '';
        //displaying message on screen received from database
        for (let i = 0; i < resp.data.message.length; i++) {
            display.innerHTML += resp.data.message[i].name + ':' + resp.data.message[i].dataValues.message + `<br>`;
        }
    }
    catch (err) {
        errordisplay.innerHTML = `something went wrong - ${err}`;
    }

}

async function savemessagetoLS() {
    try {
        messages = [];
        //To find latest message, calculating ID from where we should read messages.
        var startingFilterIndex = (indexOfMsgSaved - 15) > 0 ? indexOfMsgSaved - 15 : 0;
        const res = await axios.get(`http://localhost:5000/getCommonGroupMessage?start=${startingFilterIndex}`);
        //storing highest ID that we received.
        indexOfMsgSaved = res.data.message[res.data.message.length - 1].dataValues.id;
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
        localStorage.setItem("messages", string);

        //reading message from localstorage and display on screen
        updatechatonscreen();
    }
    catch (err) {
        console.log(err);
        errordisplay.innerHTML = `something went wrong - ${err}`;
    }
}

async function updatechatonscreen() {
    try {
        // Retrieving the string
        let retString = localStorage.getItem("messages")
        // Retrieved array
        let retArray = JSON.parse(retString)
        //cleaning the screen so that message donot repeat
        display.innerHTML = '';
        //displaying message on screen which is read from localstorage
        for (let i = 0; i < retArray.length; i++) {
            display.innerHTML += retArray[i] + `<br>`;
        }
    }
    catch (err) {
        console.log(err);
        errordisplay.innerHTML = `something went wrong - ${err}`;
    }
}

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
        const resp = await axios.post('http://localhost:5000/createGroup', { groupname: groupName }, { headers: { "Authorization": token } });
        console.log(resp.data.response.id);
        const res = await axios.get('http://localhost:5000/getAllUser');
        console.log(res.data.user);
        const showAllUser = document.getElementById('showAllUser');
        showAllUser.classList.toggle('show');
        showAllUserOnTile(res.data.user, resp.data.response.id);
    })

});
//show user when clicked on createGroup button.
async function showAllUserOnTile(obj, groupID) {
    const showAllUser = document.getElementById('showAllUser');
    for (let i = 0; i < obj.length; i++) {
        if (obj[i].id === currentUserId) {
            continue;
        }
        const div = document.createElement('div');
        const li = document.createElement('li');
        // li.appendChild(document.createTextNode(obj[i].id));
        // li.appendChild(document.createTextNode('-'));
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
                // console.log(checkboxes[i].value, checkboxes[i].id);
                ids.push(checkboxes[i].id);
            }
        }
        const res = await axios.post('http://localhost:5000/addUsersToGroup', { ids: ids, groupid: groupID }, { headers: { "Authorization": token } })
        location.reload();
    })
}

//display all group with currentUser as member on left tiles
async function displayAllGroup() {
    try {
        const res = await axios.get('http://localhost:5000/getAllUserGroup', { headers: { "Authorization": token } });
        console.log(res.data.groupdata);
        obj = { id: 0, groupname: "Common Group", createdby: '' };
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
            currentId = div.id | '0';
            previousId = localStorage.getItem('currentGroupId') | '0';
            document.getElementById(`${previousId}`).style.backgroundColor = 'white';
            localStorage.setItem("currentGroupId", currentId);
            document.getElementById(`${currentId}`).style.backgroundColor = "aqua";

            document.getElementById('GroupNamenav').innerHTML = obj.groupname;
            if (currentId == 0) {
                document.getElementById('createdBynav').innerHTML = '';
            } else {
                document.getElementById('createdBynav').innerHTML = "created By: " + obj.createdby;
            }
            await facilitiesforadmin(obj.id);
            await makechatrealtime();
        })
    }
    catch (err) {
        errordisplay.innerHTML = `something went wrong -  ${err.message}`;
    }
}

//admin functionalities based on user
async function facilitiesforadmin(groupid) {
    try {
        const res = await axios.post('http://localhost:5000/checkUserIsAdmin', { groupid: groupid }, { headers: { "Authorization": token } });

        if (res.data.isAdmin) {
            document.getElementById("searchuserbtn").disabled = false;
            document.getElementById("addusertogroupbtn").disabled = false;
            document.getElementById('removeuserfromgroupbtn').disabled=false;
            document.getElementById('isUserAdmin').innerHTML = "";
        }
        else {
            document.getElementById('isUserAdmin').innerHTML = 'You are not admin for this group' + `<hr>`;
            document.getElementById("searchuserbtn").disabled = true;
            document.getElementById("addusertogroupbtn").disabled = true;
            document.getElementById('removeuserfromgroupbtn').disabled=true;
        }
    }
    catch (err) {
        errordisplay.innerHTML = `something went wrong -  ${err.message}`;
    }
}

//admin functionalities
//find user then add to group if not memeber of group
const addusertogroupbtn = document.getElementById('addusertogroupbtn');
addusertogroupbtn.addEventListener('click', async (e) => {
    try {
        e.preventDefault();
        const data = document.getElementById('searchuser').value;
        const filtername = document.getElementById('searchuserfilter').value;
        const groupId = localStorage.getItem('currentGroupId');
        const res = await axios.post('http://localhost:5000/getUsertoaddingroupAdmin', { groupid: groupId, filtername: filtername, data: data });
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

//show user to make group Admin by Admin
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
                const res = await axios.post('http://localhost:5000/AddusertogroupAdmin', { id: obj.id, groupid: groupid });
                console.log(res.data);
                alert('user successfully added to group');
                div.removeChild(li);
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


//To make existing user group admin
const searchuserbtn = document.getElementById('searchuserbtn');
searchuserbtn.addEventListener('click', async (e) => {
    try {
        e.preventDefault();
        const display = document.getElementById('displayusertomakeadmin');
        const groupid = localStorage.getItem('currentGroupId');
        const res = await axios.post('http://localhost:5000/getAllUserforAdmin', { groupid: groupid });
        display.innerHTML = '';
        if(res.data.userdata.length===0){errordisplay.innerHTML=`No more user to make admin of group - All user are admin`;}
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
                    const resp = await axios.post('http://localhost:5000/makeGroupAdmin', { id: res.data.userdata[i].id, groupid: groupid }, { headers: { "Authorization": token } });
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
        groupid = localStorage.getItem('currentGroupId');
        const display = document.getElementById('displayUserToBeremovedfromGroup');
        const res = await axios.post('http://localhost:5000/getAllUserOfGroup', { groupid: groupid }, { headers: { "Authorization": token } });
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
                    const resp = await axios.post('http://localhost:5000/removeUserFromGroup', { groupid: groupid, userid: res.data.userdata[i].id });
                    alert('user successfully removed from group');
                    console.log(resp.data);
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








