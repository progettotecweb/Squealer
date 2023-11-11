async function signout() {
    await fetch("/Home/api/auth/signout?callbackUrl=/Login", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: await fetch("/Home/api/auth/csrf").then((rs) => rs.text()),
    }).then((res) => {
        res.ok
            ? (window.location.href = "/Login")
            : console.error("Error while signing out!");
    });
};


async function getUserData() {
    const userSession = await fetch("/Home/api/user", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(res => res.json())
        .then(data => {
            return data;
        })
        .catch(err => {
            console.log(err);
        });

    const userInfo = await fetch("/api/users/" + userSession.id, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(data => {
            //console.log(data);
            return data;
        })
        .catch(err => {
            console.log(err);
            signout();
        });


    //se userinfo non è valido dell'user non è stato trovato lo sloggo
    if (!userInfo) {
        signout();
    }

    //riempio i campi 
    document.getElementById("master-user-name").innerHTML = userInfo.name;
    const blobsrc = "data:" + userInfo.img.mimetype + ";base64," + userInfo.img.blob;
    document.getElementById("master-user-img").src = blobsrc;
}

getUserData();

window.onload = function () {
    //load active section
    const activeSection = document.querySelector(".active-section");
    loadSection(activeSection);

    const boxContentDiv = document.querySelector("#box-content");
    boxContentDiv.addEventListener("scroll", (e) => {
        const activeSection = document.querySelector(".active-section");

        //check if the scroll is at the top
        if (boxContentDiv.scrollTop === 0) {
            //aggiungo la mia classe
            activeSection.classList.add("active-section-not-scrolled");
        }
        else {
            activeSection.classList.remove("active-section-not-scrolled");
        }
    });

    const sectionList = document.querySelector(".section-list");
    sectionList.addEventListener("click", (e) => {
        if (e.target.classList.contains("box-section")) {
            loadSection(e.target);
        }
    });


    function loadSection(section) {
        switch (section.id) {
            case "userSection":
                loadUsers();
                break;
            case "channelSection":
                loadChannels();
                break;
            case "squealSection":
                loadSqueals();
                break;
        }
    }



    async function loadUsers(orderBy = "alphabetical", showSelf = true) {
        const allUsers = await fetch("/api/users/all", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                //console.log(data);
                const boxContent = document.getElementById("box-content");
                //clear the box
                boxContent.innerHTML = "";

                //sort the users
                switch (orderBy) {
                    case "alphabetical":
                        data.sort((a, b) => {
                            if (a.name < b.name) {
                                return -1;
                            }
                            if (a.name > b.name) {
                                return 1;
                            }
                            return 0;
                        });
                        break;
                    case "popularity":
                        data.sort((a, b) => {
                            if (a.popularity < b.popularity) {
                                return 1;
                            }
                            if (a.popularity > b.popularity) {
                                return -1;
                            }
                            return 0;
                        });
                        break;
                }

                //create the cards for every user
                for (let i = 0; i < data.length; i++) {
                    //check if the user is the moderator and if he wants to see himself
                    let mycard = "<div class='my-card'>";

                    const blobsrc = "data:" + data[i].img.mimetype + ";base64," + data[i].img.blob;
                    let img = "<img src='" + blobsrc + "' alt='" + data[i].name + "'s propic' class='user-pic my-card-grid-tl'/>";
                    mycard += img;
                    mycard += '<div class="user-content my-card-grid-tr">';
                    let content = "<p class='user-name'>" + data[i].name + "</p>";
                    content += "<p class='user-popularity'>⭐" + data[i].popularity + "</p>";
                    mycard += content;
                    mycard += "</div>";
                    let userInfoDataBs = 'data-bs-userId="' + data[i]._id + '" data-bs-toggle="modal" data-bs-target="#userModal" data-bs-username="'
                        + data[i].name + '" data-bs-userimg="' + blobsrc + '" data-bs-quota_daily="' + data[i].msg_quota.daily
                        + '"data-bs-quota_monthly="' + data[i].msg_quota.monthly + '" data-bs-quota_weekly="' + data[i].msg_quota.weekly
                        + '" data-bs-quota_extra="' + data[i].msg_quota.extra + '"' + 'data-bs-blocked="' + data[i].blocked + '"';
                    let btn = '<input type="button" class="user-btn btn btn-primary align-self-center"' + userInfoDataBs + ' value="View more" />';
                    let footer = '<div class="card-user-footer my-card-grid-b d-flex justify-content-center">' + btn + '</div>';
                    mycard += footer;
                    mycard += "</div>";
                    boxContent.innerHTML += mycard;
                }

                //return data;
            })
            .catch(err => {
                console.log(err);
            });
    }


    async function loadChannels(orderBy = "alphabetical") {
        const allChannels = await fetch("/api/channels/allChannels", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                //console.log(data);
                const boxContent = document.getElementById("box-content");
                //clear the box
                boxContent.innerHTML = "";

                //create the cards for every channel
                for (let i = 0; i < data.length; i++) {
                    let mycard = "<div class='my-card'>";

                    //const blobsrc = "data:" + data[i].img.mimetype + ";base64," + data[i].img.blob;
                    //let img = "<img src='" + blobsrc + "' alt='" + data[i].name + "'s propic' class='user-pic'/>";
                    //mycard += img;
                    mycard += '<div class="channel-content my-card-grid-tl">';
                    let content = "<p class='channel-name'>" + data[i].name + "</p>";
                    content += "<p class='channel-description'>" + data[i].description + "</p>";
                    mycard += content;
                    mycard += "</div>";
                    mycard += '<div class="my-card-grid-tr">';
                    let official = data[i].official === true ? "Official" : "Unofficial"
                    mycard += '<p class = "channel-official-card">' + official + '</p>';
                    mycard += '</div>';
                    let channelInfoDataBs = 'data-bs-channelId="' + data[i]._id + '"'
                        + 'data-bs-toggle="modal"'
                        + 'data-bs-target="#channelModal"'
                        + 'data-bs-channelName="' + data[i].name + '"'
                        + 'data-bs-channelDescription="' + data[i].description + '"'
                        + 'data-bs-channelVisibility="' + data[i].visibility + '"'
                        + 'data-bs-channelOwner="' + data[i].owner + '"'
                        + 'data-bs-channelFollowers="' + data[i].followers + '"'
                        + 'data-bs-channelSqueals="' + data[i].squeals + '"'
                        //+ 'data-bs-administrators-name="' + usersIdToName(data[i].administrators, data[i]._id, "data-bs-administrators-name") + '"'
                        + 'data-bs-administrators-id="' + data[i].administrators + '"'
                        + 'data-bs-canUserPost="' + data[i].can_user_post + '"'
                        + 'data-bs-official="' + data[i].official + '"'
                        + 'data-bs-blocked="' + data[i].blocked + '"';

                    if (data[i].administrators)//se ci sono admin, altrimenti null
                        usersIdToName(data[i].administrators, data[i]._id, "data-bs-administrators-name")
                    let btn = '<input type="button" class="m-1 channel-btn btn btn-primary align-self-end"' + channelInfoDataBs + ' value="Details" />';

                    let channelSquealsInfoDataBs = 'data-bs-channelId="' + data[i]._id + '"'
                        + 'data-bs-toggle="modal"'
                        + 'data-bs-target="#channelSquealsModal"'
                        + 'data-bs-channelName="' + data[i].name + '"'
                        + 'data-bs-channelDescription="' + data[i].description + '"'
                        + 'data-bs-channelVisibility="' + data[i].visibility + '"'
                        + 'data-bs-channelOwner="' + data[i].owner + '"'
                        + 'data-bs-channelFollowers="' + data[i].followers + '"'
                        + 'data-bs-administrators-id="' + data[i].administrators + '"'
                        + 'data-bs-canUserPost="' + data[i].can_user_post + '"'
                        + 'data-bs-official="' + data[i].official + '"'
                        + 'data-bs-blocked="' + data[i].blocked + '"'
                        + 'data-bs-channelSqueals="' + data[i].squeals + '"';

                    //console.log(data[i].squeals);
                    //setChannelSquealsAttributes(data[i]._id, "data-bs-channelSqueals");
                    let btnChannel_squeals = '<input type="button" class="m-1 channel-btn btn btn-secondary align-self-end" ' + channelSquealsInfoDataBs + ' value="Squeals" />';
                    let footer = '<div class="card-channel-footer my-card-grid-b d-flex justify-content-center">' + btn + btnChannel_squeals + '</div>';
                    mycard += footer;
                    mycard += "</div>";
                    boxContent.innerHTML += mycard;
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    const userModal = document.getElementById('userModal')
    if (userModal) {
        userModal.addEventListener('show.bs.modal', event => {
            // Button that triggered the modal
            const button = event.relatedTarget
            // Extract info from data-bs-* attributes
            const databs = {
                id: button.getAttribute('data-bs-userId'),
                username: button.getAttribute('data-bs-username'),
                img: button.getAttribute('data-bs-userimg'),
                quota: {
                    daily: button.getAttribute('data-bs-quota_daily'),
                    weekly: button.getAttribute('data-bs-quota_weekly'),
                    monthly: button.getAttribute('data-bs-quota_monthly'),
                    extra: button.getAttribute('data-bs-quota_extra')
                },
                blocked: button.getAttribute('data-bs-blocked')
            }

            // Update the modal's content.
            const modalTitle = userModal.querySelector('.modal-title')
            const modalImg = userModal.querySelector('.modal-img')
            const modalBody = userModal.querySelector('.selected-user-info')
            const btnBlock = userModal.querySelector("#btn-blockuser");
            const blockText = userModal.querySelector("#blocked-text");
            const btnSave = userModal.querySelector("#btn-savechanges");
            const inputQuotaDaily = userModal.querySelector("#user-quota-daily");
            const inputQuotaWeekly = userModal.querySelector("#user-quota-weekly");
            const inputQuotaMonthly = userModal.querySelector("#user-quota-monthly");
            const inputQuotaExtra = userModal.querySelector("#user-quota-extra");

            //set input values
            //msg quota
            inputQuotaDaily.value = databs.quota.daily;
            inputQuotaWeekly.value = databs.quota.weekly;
            inputQuotaMonthly.value = databs.quota.monthly;
            inputQuotaExtra.value = databs.quota.extra;

            //blocked
            if (databs.blocked === "false") {
                //modalBody.innerHTML += btnBlock;
                btnBlock.classList.remove("btn-secondary");
                btnBlock.classList.add("btn-danger");
                btnBlock.innerHTML = "Block user";
                blockText.innerHTML = "unblocked";

            } else {
                btnBlock.classList.remove("btn-danger");
                btnBlock.classList.add("btn-secondary");
                btnBlock.innerHTML = "Unblock user";
                blockText.innerHTML = "blocked";
            }

            modalTitle.textContent = databs.username
            modalImg.src = databs.img

            btnSave.setAttribute("data-bs-userId", databs.id);
            btnSave.setAttribute("data-bs-operation", "users")
        })
    }

    //reset values when modal is closed
    userModal.addEventListener('hidden.bs.modal', () => {
        //reset btn
        const btnBlock = userModal.querySelector("#btn-blockuser");
        btnBlock.disabled = false;
        btnBlock.setAttribute("data-bs-value_block", "false");
    });

    //change btn value when clicked
    const btnBlockUser = document.getElementById("btn-blockuser");
    btnBlockUser.addEventListener("click", async () => {
        btnBlockUser.disabled = true;
        btnBlockUser.setAttribute("data-bs-value_block", "true");
    });

    const channelModal = document.getElementById('channelModal')
    if (channelModal) {
        channelModal.addEventListener('show.bs.modal', event => {
            // Button that triggered the modal
            const button = event.relatedTarget
            // Extract info from data-bs-* attributes
            const databs = {
                id: button.getAttribute('data-bs-channelId'),
                name: button.getAttribute('data-bs-channelName'),
                description: button.getAttribute('data-bs-channelDescription'),
                visibility: button.getAttribute('data-bs-channelVisibility'),
                owner: button.getAttribute('data-bs-channelOwner'),
                followers: button.getAttribute('data-bs-channelFollowers'),
                squeals: button.getAttribute('data-bs-channelSqueals'),
                administratorsName: button.getAttribute('data-bs-administrators-name'),
                administratorsId: button.getAttribute('data-bs-administrators-id'),
                canUserPost: button.getAttribute('data-bs-canUserPost'),
                official: button.getAttribute('data-bs-official'),
                blocked: button.getAttribute('data-bs-blocked')
            }

            // Update the modal's content.
            const modalTitle = channelModal.querySelector('.modal-title')
            //const modalImg = userModal.querySelector('.modal-img')
            const modalBody = channelModal.querySelector('.selected-channel-info')
            const btnBlock = channelModal.querySelector("#btn-blockChannel");
            const blockText = channelModal.querySelector("#blocked-text");
            const btnVisible = channelModal.querySelector("#btn-visibilityChannel");
            const visibleText = channelModal.querySelector("#visibility-text");
            const btnSave = channelModal.querySelector("#btn-savechanges");
            const inputName = channelModal.querySelector("#channel-name");
            const inputDescription = channelModal.querySelector("#channel-description");
            const inputAdmins = channelModal.querySelector("#channel-administrators");
            const officialText = channelModal.querySelector("#channel-official");

            //set input values
            inputName.value = databs.name;
            inputDescription.value = databs.description;
            inputAdmins.value = databs.administratorsName;
            //setAdminInput(databs.administratorsName, inputAdmins);
            if (databs.administratorsId) {
                inputAdmins.setAttribute("data-bs-administrators-id", databs.administratorsId);
            }
            officialText.textContent = databs.official === "true" ? "Official" : "Unofficial";

            //admin 
            //reset check admins label and checkbox
            const checkAdmins = channelModal.querySelector("#channel-administrators-checkbox");
            checkAdmins.checked = false;
            const correctLabel = document.querySelector("#channel-administrators-label");
            correctLabel.classList.remove("text-danger");
            correctLabel.classList.remove("text-success");
            correctLabel.innerHTML = "Insert username(s) separated by a comma";


            //blocked
            if (databs.blocked === "false") {
                //modalBody.innerHTML += btnBlock;
                btnBlock.classList.remove("btn-secondary");
                btnBlock.classList.add("btn-danger");
                btnBlock.innerHTML = "Block channel";
                blockText.innerHTML = "unblocked";

            } else {
                btnBlock.classList.remove("btn-danger");
                btnBlock.classList.add("btn-secondary");
                btnBlock.innerHTML = "Unblock channel";
                blockText.innerHTML = "blocked";
            }

            //visibility
            if (databs.visibility === "public") {
                btnVisible.classList.remove("btn-secondary");
                btnVisible.classList.add("btn-danger");
                btnVisible.innerHTML = "Make private";
                visibleText.innerHTML = "public";
            } else {
                btnVisible.classList.remove("btn-danger");
                btnVisible.classList.add("btn-secondary");
                btnVisible.innerHTML = "Make public";
                visibleText.innerHTML = "private";
            }

            modalTitle.textContent = databs.name
            //modalImg.src = databs.img

            btnSave.setAttribute("data-bs-channelId", databs.id);
            btnSave.setAttribute("data-bs-operation", "channels")
        })

        //add event listener to the administrators input
        const inputAdmins = channelModal.querySelector("#channel-administrators");
        const checkAdmins = channelModal.querySelector("#channel-administrators-checkbox");
        checkAdmins.addEventListener("change", async (e) => {
            if (checkAdmins.checked) {
                setAdminInput(inputAdmins.value, inputAdmins, true);
            }
            else {
                //reset check admins label and checkbox
                const correctLabel = document.querySelector("#channel-administrators-label");
                correctLabel.classList.remove("text-danger");
                correctLabel.classList.remove("text-success");
                correctLabel.innerHTML = "Insert username(s) separated by a comma";
            }
        });
    }

    //reset values when modal is closed
    channelModal.addEventListener('hidden.bs.modal', () => {
        //reset btn block
        const btnBlock = channelModal.querySelector("#btn-blockChannel");
        btnBlock.disabled = false;
        btnBlock.setAttribute("data-bs-value_block", "false");

        //reset btn visibility
        const btnVisible = channelModal.querySelector("#btn-visibilityChannel");
        btnVisible.disabled = false;
        btnVisible.setAttribute("data-bs-value_visibility", "false");

        //reset check admins label and checkbox
        const checkAdmins = channelModal.querySelector("#channel-administrators-checkbox");
        checkAdmins.checked = false;
        const correctLabel = document.querySelector("#channel-administrators-label");
        correctLabel.classList.remove("text-danger");
        correctLabel.classList.remove("text-success");
        correctLabel.innerHTML = "Insert username(s) separated by a comma";
    });

    //change btn value when clicked
    const btnblockChannel = document.getElementById("btn-blockChannel");
    btnblockChannel.addEventListener("click", async () => {
        btnblockChannel.disabled = true;
        btnblockChannel.setAttribute("data-bs-value_block", "true");
    });
    const btnVisibilityChannel = document.getElementById("btn-visibilityChannel");
    btnVisibilityChannel.addEventListener("click", async () => {
        btnVisibilityChannel.disabled = true;
        btnVisibilityChannel.setAttribute("data-bs-value_visibility", "true");
    });


    const channelSquealsModal = document.getElementById('channelSquealsModal')
    if (channelSquealsModal) {
        channelSquealsModal.addEventListener('show.bs.modal', event => {
            // Button that triggered the modal
            const button = event.relatedTarget
            // Extract info from data-bs-* attributes
            const databs = {
                id: button.getAttribute('data-bs-channelId'),
                name: button.getAttribute('data-bs-channelName'),
                description: button.getAttribute('data-bs-channelDescription'),
                visibility: button.getAttribute('data-bs-channelVisibility'),
                owner: button.getAttribute('data-bs-channelOwner'),
                followers: button.getAttribute('data-bs-channelFollowers'),
                squeals: button.getAttribute('data-bs-channelSqueals'),
                administratorsName: button.getAttribute('data-bs-administrators-name'),
                administratorsId: button.getAttribute('data-bs-administrators-id'),
                canUserPost: button.getAttribute('data-bs-canUserPost'),
                official: button.getAttribute('data-bs-official'),
                blocked: button.getAttribute('data-bs-blocked')
            }

            // Update the modal's content.
            const modalTitle = channelSquealsModal.querySelector('.modal-title')
            //const modalImg = userModal.querySelector('.modal-img')
            const modalBody = channelSquealsModal.querySelector('.selected-channel-info')
            const btnSave = channelSquealsModal.querySelector("#btn-savechanges");

            modalTitle.textContent = databs.name

            const viewSquealsDiv = channelSquealsModal.querySelector(".channel-view-squeals");
            viewSquealsDiv.innerHTML = "";

            //create the cards for every squeal
            searchAndAddSqueals(databs.squeals, viewSquealsDiv);

            btnSave.setAttribute("data-bs-channelId", databs.id);
            btnSave.setAttribute("data-bs-operation", "channels")
        });
    }

    //save changes if button is pressed, add event listener to every button
    const btnSave = document.getElementsByClassName("btn-savechanges");
    for (let i = 0; i < btnSave.length; i++) {
        btnSave[i].addEventListener("click", (e) => {
            //console.log(e.target)
            updateDBandSection(e.target);
        });
    }

    //update the db and reload the section
    async function updateDBandSection(btn) {
        //retrieve operation type
        const operationUpdate = btn.getAttribute("data-bs-operation");
        let id;
        let table;

        switch (operationUpdate) {
            case "users":
                id = btn.getAttribute("data-bs-userId");
                table = "users";
                break;
            case "channels":
                id = btn.getAttribute("data-bs-channelId");
                table = "channels";
                break;
            case "squeals":
                break;
        }


        let data = await fetch("/api/" + table + "/" + id, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                return data;
            })
            .catch(err => {
                console.log(err);
            });

        //retrieve data to update from modal
        let dataToUpdate;
        switch (operationUpdate) {
            case "users":
                dataToUpdate = {
                    blocked: document.querySelector("#btn-blockuser").getAttribute("data-bs-value_block") === "true" ? !data.blocked : data.blocked,
                    msg_quota: {
                        daily: document.querySelector("#user-quota-daily").value,
                        weekly: document.querySelector("#user-quota-weekly").value,
                        monthly: document.querySelector("#user-quota-monthly").value,
                        extra: document.querySelector("#user-quota-extra").value
                    }
                }
                break;
            case "channels":
                dataToUpdate = {
                    blocked: document.querySelector("#btn-blockChannel").getAttribute("data-bs-value_block") === "true" ? !data.blocked : data.blocked,
                    visibility: document.querySelector("#btn-visibilityChannel").getAttribute("data-bs-value_visibility") === "true" ? data.visibility === "public" ? "private" : "public" : data.visibility,
                    name: document.querySelector("#channel-name").value,
                    description: document.querySelector("#channel-description").value,
                    administrators: document.querySelector("#channel-administrators").value != '' ? document.querySelector("#channel-administrators").getAttribute("data-bs-administrators-id").replace('\n', '').split(',') : null,
                }
                break;

            case "squeals":
                break;
        };

        Object.keys(dataToUpdate).forEach(key => {
            data[key] = dataToUpdate[key];
        });

        //update table
        await fetch("/api/" + table + "/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                if (res.ok) {
                    //console.log("Data updated!");
                } else {
                    console.log("Error while updating data!");
                }
            })
            .catch(err => {
                console.log(err);
            });


        //reload the section
        switch (operationUpdate) {
            case "users":
                loadUsers(document.getElementById("select-orderby").value);
                break;
            case "channels":
                loadChannels();
                break;
            case "squeals":
                break;
        }
    }

    //event listener for the order by select
    const selectOrderBy = document.getElementById("select-orderby");
    selectOrderBy.addEventListener("change", (e) => {
        const value = e.target.value;
        loadUsers(value);
    });

    //change active section
    const userSection = document.getElementById("userSection");
    const channelSection = document.getElementById("channelSection");
    const squealSection = document.getElementById("squealSection");

    userSection.addEventListener("click", (e) => {
        changeSectionClass(e.target);
    });

    channelSection.addEventListener("click", (e) => {
        changeSectionClass(e.target);

    });

    squealSection.addEventListener("click", (e) => {
        changeSectionClass(e.target);
    });
}

function changeSectionClass(newSection) {
    //before adding the new class, remove the old one
    const activeSection = document.querySelector(".active-section");
    activeSection.classList.remove("active-section");
    activeSection.classList.remove("active-section-not-scrolled");

    //update the section
    newSection.classList.add("active-section");
    newSection.classList.add("active-section-not-scrolled");
}

async function usersIdToName(usersId, channelId, dataBsName) {
    let usersName = [];
    for (let i = 0; i < usersId.length; i++) {
        if (usersId[i] === ",") continue;
        const user = await fetch("/api/users/" + usersId[i], {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                return data.name;
            })
            .catch(err => {
                console.log(err);
            });

        usersName.push(user);
    }

    //update data in btn
    const btn = document.querySelectorAll(".channel-btn");

    //search channel id btn
    for (let i = 0; i < btn.length; i++) {
        if (btn[i].getAttribute("data-bs-channelId") == channelId) {
            btn[i].setAttribute(dataBsName, usersName.join(", "));
        }
    }
}

async function usersNameToId(usersNames, div, dataBsName) {
    // normalize the string for our purpose
    let usersNamesArray = usersNames.trim();//remove spaces
    usersNamesArray = usersNamesArray.replace(/\s+/g, '');// remove spaces
    usersNamesArray = usersNamesArray.split(",");   // split the string into an array of strings

    let usersId = [];
    const correctLabel = document.querySelector("#channel-administrators-label");

    //get all users from db
    const allUsers = await fetch("/api/users/all", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(data => {
            //console.log(data);
            return data;
        })
        .catch(err => {
            console.log(err);
        });

    //check if the users exist in the data retrieved from db
    for (let i = 0; i < usersNamesArray.length; i++) {
        let found = false;
        for (let j = 0; j < allUsers.length; j++) {
            if (usersNamesArray[i] === allUsers[j].name) {
                usersId.push(allUsers[j]._id);
                found = true;
                break;
            }
        }
        if (!found) {
            //set wrong label
            correctLabel.classList.add("text-danger");
            correctLabel.classList.remove("text-success");
            correctLabel.innerHTML = "Wrong username(s)!";

            return;
        }
    }

    //console.log(usersId);
    //update data in input div
    div.setAttribute(dataBsName, usersId.join(","));

    //set correct label
    correctLabel.classList.add("text-success");
    correctLabel.classList.remove("text-danger");
    correctLabel.innerHTML = "Correct username(s)!";
}

async function setAdminInput(value, inputAdmins, toId = false) {
    if (toId) {
        const usersId = await usersNameToId(value, inputAdmins, "data-bs-administrators-id");
    }
    inputAdmins.value = value;
    inputAdmins.setAttribute("data-bs-administrators-name", value);
    //inputAdmins.setAttribute("data-bs-administrators-id", usersId);
}

async function setChannelSquealsAttributes(channelId, attributeName) {
    //search squeals that have the channel as recipient
    const channelSqueals = await fetch("/api/squeals/allSquealsByChannel/" + channelId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(data => {
            return data;
        })
        .catch(err => {
            console.log(err);
        });
}


async function searchAndAddSqueals(squealsId, div) {
    let squealIdArray = squealsId.split(",");

    for (let i = 0; i < squealIdArray.length; i++) {
        if (squealIdArray[i] === "") continue;
        const squeal = await fetch("/api/squeals/search/" + squealIdArray[i], {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                return data;
            })
            .catch(err => {
                console.log(err);
            });

        const owner = await fetch("/api/users/" + squeal.ownerID, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                return data;
            })
            .catch(err => {
                console.log(err);
            });

        addSquealCard(squeal, owner, div);
    }

    function addSquealCard(squeal, owner, div) {
        //create the card

        let header = '<div class="squeal-header d-flex justify-content-between">';
        let ownerDiv = '<div class="squeal-owner-div align-self-center">'
            + '<img src="data:' + owner.img.mimetype + ';base64,' + owner.img.blob + '" alt="' + owner.name + '\'s propic" class="user-pic"/>'
            + '<span class="squeal-owner-name h6">' + owner.name + '</span>'
            + '</div>';
        let datetime = '<div class="squeal-date-div align-self-center">' +
            '<span class="squeal-date">' + formatDate(squeal.datetime) + '</span>'
            + '</div>';
        let automatic = '<div class="squeal-automatic-div align-self-center">' +
            '<span class="squeal-automatic"><b>' + (squeal.automatic === 'true' ? 'Automatic' : '') + '</b></span>' +
            '</div>';

        header += ownerDiv;
        header += datetime;
        header += automatic;
        header += '</div>';

        let content = '<div class="squeal-content text-center">';
        let text = '<p class="squeal-text">' + squeal.content + '</p>';
        let replies = '<div class="squeal-replies">';
        replies += '</div>';

        content += text;
        content += '</div>';

        let footer = '<div class="squeal-footer">';
        let reactions = '<div class="squeal-reactions squeal-footer-tl">'
            + '<span>'
            + '😡' + squeal.reactions.m2 + ' '
            + '😒' + squeal.reactions.m1 + ' '
            + '😄' + squeal.reactions.p1 + ' '
            + '😝' + squeal.reactions.p2 + ' '
            + '</span>'
            + '</div>';
        let CM = '<div class="squeal-cm squeal-footer-bl">'
            + '<span><b>CM</b>: ' + squeal.cm.label.type + '</span>'
            + '</div>';
        let impressions = '<div class="squeal-impressions squeal-footer-tr">'
            + '<span>' + squeal.impressions + ' impression(s)</span>'
            + '</div>';
        let controversial = '<div class="squeal-controversial squeal-footer-br">'
            + '<span><i>' + (squeal.controversial === 'true' ? 'Controversial' : 'Not controversial') + '</i></span>'
            + '</div>';

        footer += reactions;
        footer += CM;
        footer += impressions;
        footer += controversial;
        footer += '</div>';

        let btnDelete = '<div class="d-flex justify-content-center mt-2"><input type="button" class="squeal-btn btn btn-danger align-self-center" data-bs-squealId="' + squeal._id + '" value="Delete squeal" /></div>';
        let mycard = "<div class='my-card-squeal'>";
        mycard += header;
        mycard += content;
        mycard += footer;
        mycard += btnDelete;
        mycard += '</div>'
        div.innerHTML += mycard;
    }
}

function formatDate(date) {
    const d = new Date(date);
    const month = d.getMonth();//+1
    const day = d.getDate();
    const year = d.getFullYear();
    const hour = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();

    return day + "/" + month + "/" + year + " " + hour + ":" + minutes;
}