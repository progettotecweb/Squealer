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


    //se userinfo dell'user non è valido non è stato trovato lo sloggo
    if (!userInfo) {
        signout();
    }

    //riempio i campi 
    document.getElementById("master-user-name").innerHTML = userInfo.name;
    const blobsrc = "/api/media/" + userInfo.img;
    document.getElementById("master-user-img").src = blobsrc;
    //add data-bs master user id
    document.getElementById("master-user-name").setAttribute("data-bs-master_user_id", userInfo._id);
    document.getElementById("master-user-name").setAttribute("data-bs-master_user_blocked", userInfo.blocked);
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
    //click on section event listener
    sectionList.addEventListener("click", async (e) => {
        if (e.target.classList.contains("box-section")) {
            await loadSection(e.target);
        }
    });

    //press enter on section event listener
    sectionList.addEventListener("keypress", async (e) => {
        if (e.key === "Enter") {
            if (e.target.classList.contains("box-section")) {
                await loadSection(e.target);
            }
        }
    });


    async function loadSection(section) {
        switch (section.id) {
            case "userSection":
                await loadUsers();
                break;
            case "channelSection":
                await loadChannels();
                break;
            case "squealSection":
                await loadSqueals();
                break;
        }
    }



    async function loadUsers(searchName = null, showSelf = true) {
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

                //get the filters attributes from the filter btn
                const btnFilter = document.querySelector("#btn-filter");
                const filter = {
                    orderBy: btnFilter.getAttribute("data-bs-userFilter-orderby") === null ? "alphabetical" : btnFilter.getAttribute("data-bs-userFilter-orderby"),
                    type: btnFilter.getAttribute("data-bs-userFilter-type") === null ? "All" : btnFilter.getAttribute("data-bs-userFilter-type")
                };

                //sort the users
                switch (filter.orderBy) {
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

                let userShownCount = 0

                //create the cards for every user
                for (let i = 0; i < data.length; i++) {
                    //check the filter type and skip the user if it doesn't match, or show all
                    if (filter.type != "All" && data[i].role != filter.type) continue;

                    //check if the user is searched
                    if (searchName != null && !(data[i].name.toLowerCase() == searchName.toLowerCase())) continue;

                    let mycard = "<div class='my-card my-card-grid-tl-tr-b'>";

                    const blobsrc = "/api/media/" + data[i].img;
                    let img = "<img src='" + blobsrc + "' alt='" + data[i].name + "'s profile picture' class='user-pic my-card-grid-tl'/>";
                    mycard += img;
                    mycard += '<div class="user-content my-card-grid-tr">';
                    let content = "<p class='user-name h5'>" + data[i].name + "</p>";
                    content += "<p class='user-role'>" + data[i].role + "</p>";
                    content += "<p class='user-popularity'>⭐" + data[i].popularity + "</p>";
                    mycard += content;
                    mycard += "</div>";
                    let userInfoDataBs = 'data-bs-userId="' + data[i]._id + '" data-bs-toggle="modal" data-bs-target="#userModal" data-bs-username="'
                        + data[i].name + '" data-bs-userimg="' + blobsrc + '" data-bs-quota_daily="' + data[i].msg_quota.daily
                        + '"data-bs-quota_monthly="' + data[i].msg_quota.monthly + '" data-bs-quota_weekly="' + data[i].msg_quota.weekly
                        + '" data-bs-quota_extra="' + data[i].msg_quota.extra + '"' + 'data-bs-blocked="' + data[i].blocked + '"'
                        + 'data-bs-role="' + data[i].role + '"';
                    let btn = '<input type="button" class="user-btn btn btn-primary align-self-center"' + userInfoDataBs + ' value="View more" />';
                    let footer = '<div class="card-user-footer my-card-grid-b d-flex justify-content-center">' + btn + '</div>';
                    mycard += footer;
                    mycard += "</div>";
                    boxContent.innerHTML += mycard;

                    userShownCount++;
                }

                if (userShownCount === 0) {
                    boxContent.innerHTML = `<div class='position-absolute d-flex justify-content-center noItems'>
                    <p class="text-center align-self-center fst-italic">No users found</p>
                    </div>`;
                }
            })
            .catch(err => {
                console.log(err);
            });
    }


    async function loadChannels(searchName = null, squeal = null) {
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

                //get the filters attributes from the filter btn
                const btnFilter = document.querySelector("#btn-filter");
                const filter = {
                    orderBy: btnFilter.getAttribute("data-bs-channelFilter-orderby") === null ? "alphabetical" : btnFilter.getAttribute("data-bs-channelFilter-orderby"),
                    type: btnFilter.getAttribute("data-bs-channelFilter-type") === null ? "All" : btnFilter.getAttribute("data-bs-channelFilter-type")
                };

                //sort the channels
                switch (filter.orderBy) {
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
                            if (a.followers.length < b.followers.length) {
                                return 1;
                            }
                            if (a.followers.length > b.followers.length) {
                                return -1;
                            }
                            return 0;
                        });
                        break;
                    case "owner":
                        data.sort((a, b) => {
                            //if owner is null then put it at the end
                            if (a.owner_id === null && b.owner_id === null) {
                                return 0;
                            }
                            if (a.owner_id === null) {
                                return 1;
                            }
                            if (b.owner_id === null) {
                                return -1;
                            }

                            if (a.owner_id.name < b.owner_id.name) {
                                return -1;
                            }
                            if (a.owner_id.name > b.owner_id.name) {
                                return 1;
                            }
                            return 0;
                        });
                        break;
                    case "squeal-number":
                        data.sort((a, b) => {
                            if (a.squeals.length < b.squeals.length) {
                                return 1;
                            }
                            if (a.squeals.length > b.squeals.length) {
                                return -1;
                            }
                            return 0;
                        });
                        break;
                }

                let channelShownCount = 0

                //create the cards for every channel
                for (let i = 0; i < data.length; i++) {
                    //check the filter type and skip the channel if it doesn't match, or show all
                    if (filter.type != "All" && (data[i].official === true ? 'Official' : 'Unofficial') != filter.type) continue;

                    //check if the channel is searched
                    if (searchName != null && !(data[i].name.toLowerCase() == searchName.toLowerCase())) continue;


                    let tot_squeal = data[i].squeals.length;

                    let mycard = "<div class='my-card my-card-grid-t-c12-b'>";

                    let name = '<div class="h5 channel-name my-card-grid-top2 text-center w-100">' + data[i].name + '</div>';
                    let description = '<div class="channel-description my-card-grid-center2 text-center w-100">' + data[i].description + '</div>';
                    let officialandowner = '<div class = "my-card-grid-b1"><div class="channel-official">' + (data[i].official === true ? "Official" : "Unofficial") + '</div>'
                        + '<div class = "channel-owner">' + (data[i].owner_id === null ? "" : ('Owner: ' + data[i].owner_id.name)) + '</div></div>';
                    let followers = '<div class = "channel-followers my-card-grid-b2">' + data[i].followers.length + ` Follower(s)<br>${tot_squeal} squeal(s)</div>`;
                    mycard += name + description + officialandowner + followers;

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
                        //+ 'data-bs-administrators-id="' + data[i].administrators + '"'
                        + 'data-bs-canUserPost="' + data[i].can_user_post + '"'
                        + 'data-bs-official="' + data[i].official + '"'
                        + 'data-bs-blocked="' + data[i].blocked + '"';

                    if (data[i].administrators) {//se ci sono admin, altrimenti null
                        admins = data[i].administrators.map((admin) => admin.name);
                        admin_ids = data[i].administrators.map((admin) => admin._id);
                        channelInfoDataBs += 'data-bs-administrators-name="' + admins + '"';
                        channelInfoDataBs += 'data-bs-administrators-id="' + admin_ids + '"';
                        //usersIdToName(data[i].administrators, data[i]._id, "data-bs-administrators-name")
                    }
                    else {
                        channelInfoDataBs += 'data-bs-administrators-name=""';
                        channelInfoDataBs += 'data-bs-administrators-id=""';
                    }
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
                        + 'data-bs-channelSqueals="' + data[i].squeals + '"'
                        + 'data-bs-master_user_id="' + document.querySelector('#master-user-name').getAttribute("data-bs-master_user_id") + '"';

                    //setChannelSquealsAttributes(data[i]._id, "data-bs-channelSqueals");
                    let btnChannel_squeals = '<input type="button" class="m-1 channel-btn btn btn-secondary align-self-end" ' + channelSquealsInfoDataBs + ' value="Squeals" />';
                    let footer = '<div class="card-channel-footer my-card-grid-bottom d-flex justify-content-center">' + btn + btnChannel_squeals + '</div></div>';
                    mycard += footer;
                    mycard += "</div>";
                    boxContent.innerHTML += mycard;

                    channelShownCount++;
                }

                if (channelShownCount === 0) {
                    boxContent.innerHTML = `<div class='position-absolute d-flex justify-content-center noItems'>
                    <p class="text-center align-self-center fst-italic">No channels found</p>
                    </div>`;
                }
            })
            .catch(err => {
                console.log(err);
            });
    }


    async function loadSqueals() {
        const allSqueals = await fetch("/api/squeals/all", {
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

                //get the filters attributes from the filter btn
                const btnFilter = document.querySelector("#btn-filter");
                const filter = {
                    orderBy: btnFilter.getAttribute("data-bs-squealsFilter-orderby") === null ? "date" : btnFilter.getAttribute("data-bs-squealsFilter-orderby"),
                    type: btnFilter.getAttribute("data-bs-squealsFilter-type") === null ? "All" : btnFilter.getAttribute("data-bs-squealsFilter-type")
                };

                //sort the squeals
                switch (filter.orderBy) {
                    case "date":
                    case "date-newer":
                        data.sort((a, b) => {
                            if (a.datetime < b.datetime) {
                                return 1;
                            }
                            if (a.datetime > b.datetime) {
                                return -1;
                            }
                            return 0;
                        });
                        break;
                    case "date-older":
                        data.sort((a, b) => {
                            if (a.datetime < b.datetime) {
                                return -1;
                            }
                            if (a.datetime > b.datetime) {
                                return 1;
                            }
                            return 0;
                        });
                        break;
                    case "owner":
                        data.sort((a, b) => {
                            if (JSON.stringify(a.ownerID.name).toUpperCase < JSON.stringify(b.ownerID.name).toUpperCase) {
                                return -1;
                            }
                            if (JSON.stringify(a.ownerID.name).toUpperCase > JSON.stringify(b.ownerID.name).toUpperCase) {
                                return 1;
                            }
                            return 0;
                        });
                        break;
                    case "recipient":
                        data.sort((a, b) => {
                            // order by recipient name 
                            const aRecipients = a.recipients ? a.recipients.map(recipient => recipient.id.name).sort() : [];
                            const bRecipients = b.recipients ? b.recipients.map(recipient => recipient.id.name).sort() : [];

                            // check if the arrays are empty
                            if (aRecipients.length === 0 && bRecipients.length === 0) {
                                return 0;
                            } else if (aRecipients.length === 0) {
                                return 1;
                            } else if (bRecipients.length === 0) {
                                return -1;
                            } else {
                                //get the last element of the arrays (the one who goes first in the alphabetical order) and compare them
                                let lastAIndex = aRecipients.length - 1;
                                let lastBIndex = bRecipients.length - 1;
                                return aRecipients[lastAIndex].localeCompare(bRecipients[lastBIndex]);
                            }
                        });
                        break;
                }

                //create the cards for every squeal
                let squealShownCount = 0
                let geoSqueals = [];
                for (let i = 0; i < data.length; i++) {
                    let geo = addSquealCard(data[i], data[i].recipients, boxContent, false, true);
                    if (geo) {
                        geoSqueals.push(geo);
                    }

                    squealShownCount++;
                }

                for (let i = 0; i < geoSqueals.length; i++) {
                    createGeoMap(geoSqueals[i].geolocation, geoSqueals[i].mapId);
                }

                if (squealShownCount === 0) {
                    boxContent.innerHTML = `<div class='position-absolute d-flex justify-content-center noItems'>
                    <p class="text-center align-self-center fst-italic">No squeals found</p>
                    </div>`;
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
                blocked: button.getAttribute('data-bs-blocked'),
                role: button.getAttribute('data-bs-role')
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
            const inputRole = userModal.querySelector("#user-role");

            //set input values
            //msg quota
            inputQuotaDaily.value = databs.quota.daily;
            inputQuotaWeekly.value = databs.quota.weekly;
            inputQuotaMonthly.value = databs.quota.monthly;
            inputQuotaExtra.value = databs.quota.extra;
            //role
            //make the role option selected
            const roleOptions = inputRole.options;
            for (let i = 0; i < roleOptions.length; i++) {
                if (roleOptions[i].value === databs.role) {
                    roleOptions[i].selected = true;
                    break;
                }
            }

            //blocked
            //if it is me, disable the block button
            if (databs.id === document.querySelector('#master-user-name').getAttribute("data-bs-master_user_id")) {
                btnBlock.disabled = true;
            }

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
            modalImg.alt = databs.username + "'s profile picture";

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

        //reload users
        loadUsers();
    });

    //change btn value when clicked
    const btnBlockUser = document.getElementById("btn-blockuser");
    btnBlockUser.addEventListener("click", async () => {
        btnBlockUser.disabled = true;
        btnBlockUser.setAttribute("data-bs-value_block", "true");
    });

    //USER FILTER MODAL
    const userFilterModal = document.getElementById('userFilterModal')
    if (userFilterModal) {
        userFilterModal.addEventListener('show.bs.modal', event => {
            // Button that triggered the modal
            const button = event.relatedTarget

            // Update the modal's content.
            const modalTitle = userFilterModal.querySelector('.modal-title');
            const orderBy = userFilterModal.querySelector('#filterUsers-select-orderby');
            const type = userFilterModal.querySelector('#filterUsers-select-type');

            const btnSave = userFilterModal.querySelector("#btn-savechanges");
            btnSave.addEventListener("click", (e) => {
                button.setAttribute("data-bs-userFilter-orderby", orderBy.value);
                button.setAttribute("data-bs-userFilter-type", type.value);
                loadUsers();
            });
        })
    }

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
            inputAdmins.value = formatAdmin(databs.administratorsName);
            //checkIfExistsAndSet(databs.administratorsName, inputAdmins);
            if (databs.administratorsId) {
                inputAdmins.setAttribute("data-bs-administrators-id", databs.administratorsId);
            }
            officialText.textContent = databs.official === "true" ? "Official" : "Unofficial";

            //admin 
            //reset check admins label
            const checkAdmins = channelModal.querySelector("#channel-administrators-checkbox");
            const correctLabel = document.querySelector("#channel-administrators-label");
            correctLabel.classList.remove("text-danger");
            correctLabel.classList.remove("text-success");
            correctLabel.innerHTML = "Insert @username(s) separated by a comma";


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
        checkAdmins.addEventListener("click", async (e) => {
            const correctLabel = document.querySelector("#channel-administrators-label");
            checkIfExistsAndSet(inputAdmins.value, inputAdmins, correctLabel, true, "data-bs-administrators-id", { user: true, channel: false, keyword: false });

            if (inputAdmins.value === "") {
                //reset check admins label and checkbox
                const correctLabel = document.querySelector("#channel-administrators-label");
                correctLabel.classList.remove("text-danger");
                correctLabel.classList.remove("text-success");
                //correctLabel.innerHTML = "Insert @username(s) separated by a comma";
            }
        });

        inputAdmins.addEventListener("input", async (e) => {
            //reset check admins label and checkbox
            const checkAdmins = channelModal.querySelector("#channel-administrators-checkbox");
            const correctLabel = document.querySelector("#channel-administrators-label");
            correctLabel.classList.remove("text-danger");
            correctLabel.classList.remove("text-success");
            correctLabel.innerHTML = "Insert @username(s) separated by a comma";
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
        const correctLabel = document.querySelector("#channel-administrators-label");
        correctLabel.classList.remove("text-danger");
        correctLabel.classList.remove("text-success");
        correctLabel.innerHTML = "Insert @username(s) separated by a comma";

        //reload channels
        loadChannels();
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
                blocked: button.getAttribute('data-bs-blocked'),
                master_user_id: button.getAttribute('data-bs-master_user_id')
            }

            // Update the modal's content.
            const modalTitle = channelSquealsModal.querySelector('.modal-title');

            modalTitle.textContent = databs.name

            //get if current mod is blocked
            const master_user_blocked = document.querySelector('#master-user-name').getAttribute("data-bs-master_user_blocked");

            const postBtn = channelSquealsModal.querySelector('#btn-savechanges');
            if (databs.visibility === "private" || databs.blocked === "true" || master_user_blocked === "true") {
                //mod cannot post in private channels
                postBtn.setAttribute("disabled", "")
            } else {
                postBtn.removeAttribute("disabled")
            }

            const viewSquealsDiv = channelSquealsModal.querySelector(".channel-view-squeals");
            viewSquealsDiv.innerHTML = "";

            //create the cards for every squeal
            let geoSqueals = searchAndAddSqueals(databs.squeals, viewSquealsDiv);

            geoSqueals.then((maps) => {
                for (let i = 0; i < maps.length; i++) {
                    let map = createGeoMap(maps[i].geolocation, maps[i].mapId);
                    setInterval(() => {
                        map.invalidateSize();
                    }, 1000);
                }
            });


            const btnSave = channelSquealsModal.querySelector("#btn-savechanges");
            btnSave.setAttribute("data-bs-channelId", databs.id);
            btnSave.setAttribute("data-bs-operation", "channel-squeal-create");
            btnSave.setAttribute("data-bs-type", "text");
        });
    }

    //reset values when modal is closed
    channelSquealsModal.addEventListener('hidden.bs.modal', () => {
        //reset textarea
        const textarea = channelSquealsModal.querySelector("#channel-post-squeal-textarea");
        textarea.value = "";

        //reload channels
        loadChannels();
    });

    const squealsModal = document.getElementById('squealModal')
    if (squealsModal) {
        squealsModal.addEventListener('show.bs.modal', event => {
            // Button that triggered the modal
            const button = event.relatedTarget
            // Extract info from data-bs-* attributes
            const databs = {
                id: button.getAttribute('data-bs-squealId'),
                owner: button.getAttribute('data-bs-squealOwner'),
                recipients: button.getAttribute('data-bs-squealRecipientsname'),
                reactions: {
                    m2: button.getAttribute('data-bs-squealReactions-m2'),
                    m1: button.getAttribute('data-bs-squealReactions-m1'),
                    p1: button.getAttribute('data-bs-squealReactions-p1'),
                    p2: button.getAttribute('data-bs-squealReactions-p2')
                },
                recipientsId: button.getAttribute('data-bs-squealRecipientsId'),
                idsType: button.getAttribute('data-bs-idsType'),
                impressions: button.getAttribute('data-bs-squealImpressions'),
                datetime: button.getAttribute('data-bs-squealDatetime'),
                controversial: button.getAttribute('data-bs-squealControversial'),
                cm: button.getAttribute('data-bs-squealCm'),
                automatic: button.getAttribute('data-bs-squealAutomatic')
            }

            // Update the modal's content.
            const modalTitle = squealsModal.querySelector('#modal-title')
            const owner = squealsModal.querySelector('#squeal-owner');
            const inputRecipients = squealsModal.querySelector('#squeal-recipients');
            const inputReactions = {
                m2: squealsModal.querySelector('#squeal-reactions-m2'),
                m1: squealsModal.querySelector('#squeal-reactions-m1'),
                p1: squealsModal.querySelector('#squeal-reactions-p1'),
                p2: squealsModal.querySelector('#squeal-reactions-p2')
            }
            const impressions = squealsModal.querySelector('#squeal-modal-impressions');
            const datetime = squealsModal.querySelector('#squeal-modal-datetime');
            const controversial = squealsModal.querySelector('#squeal-modal-controversial');
            const cm = squealsModal.querySelector('#squeal-modal-cm');
            const automatic = squealsModal.querySelector('#squeal-modal-automatic');

            const btnSave = squealsModal.querySelector("#btn-savechanges");

            //set input values
            owner.innerHTML = databs.owner;
            inputRecipients.value = databs.recipients;
            inputReactions.m2.value = databs.reactions.m2;
            inputReactions.m1.value = databs.reactions.m1;
            inputReactions.p1.value = databs.reactions.p1;
            inputReactions.p2.value = databs.reactions.p2;
            squealId = databs.id;
            inputRecipients.setAttribute("data-bs-recipients-id", databs.recipientsId);
            inputRecipients.setAttribute("data-bs-ids-type", databs.idsType);
            inputRecipients.setAttribute("data-bs-recipients-nameKeywords", databs.recipients);
            inputRecipients.setAttribute("data-bs-recipients-checked", "false");
            impressions.innerHTML = databs.impressions + " impression(s)";
            datetime.innerHTML = formatDate(databs.datetime);
            //controversial.innerHTML = databs.controversial === 'true' ? '<i>Controversial</i>' : '<i>Not controversial</i>';
            cm.innerHTML = "<b>CM</b>: " + databs.cm;
            automatic.innerHTML = databs.automatic === 'true' ? "<b>Automatic</b>" : "<b>Not automatic</b>";

            //recipients
            //reset check admins label and checkbox
            const checkRecipients = squealsModal.querySelector("#channel-recipients-checkbox");
            const correctLabel = document.querySelector("#channel-recipients-label");
            correctLabel.classList.remove("text-danger");
            correctLabel.classList.remove("text-success");
            correctLabel.innerHTML = "Insert @usernames and §channels and #keywords names separated by a comma";

            //add event listener to the recipients input
            // const inputRecipients = squealsModal.querySelector("#squeal-recipients");
            //const checkRecipients = squealsModal.querySelector("#squeal-recipients-checkbox");
            checkRecipients.addEventListener("click", async (e) => {
                const correctLabel = document.querySelector("#channel-recipients-label");
                checkIfExistsAndSet(inputRecipients.value, inputRecipients, correctLabel, true, "data-bs-recipients-id", { user: true, channel: true, keyword: true }, "data-bs-ids-type", squealId, inputRecipients);

                if (inputRecipients.value === "") {
                    //reset check admins label and checkbox
                    const correctLabel = document.querySelector("#channel-recipients-label");
                    correctLabel.classList.remove("text-danger");
                    correctLabel.classList.remove("text-success");
                    //correctLabel.innerHTML = "Insert @usernames and §channels names separated by a comma";
                }
            });

            inputRecipients.addEventListener("input", async (e) => {
                const correctLabel = document.querySelector("#channel-recipients-label");
                correctLabel.classList.remove("text-danger");
                correctLabel.classList.remove("text-success");
                correctLabel.innerHTML = "Insert @usernames and §channels and #keywords names separated by a comma";
            });

            btnSave.setAttribute("data-bs-squealId", databs.id);
            btnSave.setAttribute("data-bs-operation", "squeals")
        })


        //reset values when modal is closed
        squealsModal.addEventListener('hidden.bs.modal', () => {
            //reset checkbox 
            const checkRecipients = squealsModal.querySelector("#channel-recipients-checkbox");
            //reset check admins label
            const correctLabel = document.querySelector("#channel-recipients-label");
            correctLabel.classList.remove("text-danger");
            correctLabel.classList.remove("text-success");
            correctLabel.innerHTML = "Insert @usernames and §channels and #keywords names separated by a comma";

            //reload squeals
            loadSqueals();
        });
    }

    //save changes if button is pressed, add event listener to every button
    const btnSave = document.getElementsByClassName("btn-savechanges");
    for (let i = 0; i < btnSave.length; i++) {
        btnSave[i].addEventListener("click", async (e) => {
            await updateDBandSection(e.target);
        });
    }

    //SQUEAL FILTER MODAL
    const squealFilterModal = document.getElementById('squealFilterModal')
    if (squealFilterModal) {
        squealFilterModal.addEventListener('show.bs.modal', event => {
            // Button that triggered the modal
            const button = event.relatedTarget

            // Update the modal's content
            const modalTitle = squealFilterModal.querySelector('.modal-title');
            const orderBy = squealFilterModal.querySelector('#filterSqueal-select-orderby');

            const btnSave = squealFilterModal.querySelector("#btn-savechanges");
            btnSave.addEventListener("click", (e) => {
                button.setAttribute("data-bs-squealsFilter-orderby", orderBy.value);
                loadSqueals();
            });
        })
    }

    //CHANNEL FILTER MODAL
    const channelFilterModal = document.getElementById('channelFilterModal')
    if (channelFilterModal) {
        channelFilterModal.addEventListener('show.bs.modal', event => {
            // Button that triggered the modal
            const button = event.relatedTarget

            // Update the modal's content.
            const modalTitle = channelFilterModal.querySelector('.modal-title');
            const orderBy = channelFilterModal.querySelector('#filterChannels-select-orderby');
            const type = channelFilterModal.querySelector('#filterChannels-select-type');

            const btnSave = channelFilterModal.querySelector("#btn-savechanges");
            btnSave.addEventListener("click", (e) => {
                button.setAttribute("data-bs-channelFilter-orderby", orderBy.value);
                button.setAttribute("data-bs-channelFilter-type", type.value);
                loadChannels();
            });
        })
    }

    //update the db and reload the section
    async function updateDBandSection(btn) {
        //retrieve operation type
        const operationUpdate = btn.getAttribute("data-bs-operation");
        let id;
        let table;
        let crud;

        switch (operationUpdate) {
            case "users":
                id = btn.getAttribute("data-bs-userId");
                table = "users";
                crud = "UPDATE";
                break;
            case "channels":
                id = btn.getAttribute("data-bs-channelId");
                table = "channels/id";
                crud = "UPDATE";
                break;
            case "channel-squeal-create":
                id = btn.getAttribute("data-bs-channelId");
                table = "squeals";
                crud = "CREATE";
                break;
            case "channel-squeal-delete":
                //id = btn.getAttribute("data-bs-channelId");
                table = "squeals";
                crud = "CREATE";
                break;
            case "squeals":
                id = btn.getAttribute("data-bs-squealId");
                table = "squeals";
                crud = "UPDATE";
                break;
        }

        switch (crud) {
            case "UPDATE":
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
                            },
                            role: document.querySelector("#user-role").value
                        }
                        break;

                    case "channels":
                        dataToUpdate = {
                            blocked: document.querySelector("#btn-blockChannel").getAttribute("data-bs-value_block") === "true" ? !data.blocked : data.blocked,
                            visibility: document.querySelector("#btn-visibilityChannel").getAttribute("data-bs-value_visibility") === "true" ? data.visibility === "public" ? "private" : "public" : data.visibility,
                            name: document.querySelector("#channel-name").value,
                            description: document.querySelector("#channel-description").value,
                            administrators: getAdminsFromModal()
                            //administrators: document.querySelector("#channel-administrators").value != '' ? document.querySelector("#channel-administrators").getAttribute("data-bs-administrators-id").replace('\n', '').split(',') : null
                        }
                        break;

                    case "squeals":
                        dataToUpdate = {
                            recipients: getRecipientsFromModal(),
                            reactions: {
                                m2: document.querySelector("#squeal-reactions-m2").value,
                                m1: document.querySelector("#squeal-reactions-m1").value,
                                p1: document.querySelector("#squeal-reactions-p1").value,
                                p2: document.querySelector("#squeal-reactions-p2").value
                            }
                        }
                        break;
                };

                Object.keys(dataToUpdate).forEach(key => {
                    data[key] = dataToUpdate[key];
                });


                //update table
                fetch("/api/" + table + "/" + id, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dataToUpdate)
                })
                    .then(res => {
                        if (res.ok) {
                        } else {
                            console.log("Error while updating data!");
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
                break;

            case "CREATE":
                if (operationUpdate === "channel-squeal-create" && document.querySelector("#channel-post-squeal-textarea").value != '') {//create squeal
                    //retrieve data to update from modal
                    let dataToUpdate = {
                        ownerID: document.querySelector("#master-user-name").getAttribute("data-bs-master_user_id"),
                        type: btn.getAttribute("data-bs-type"),
                        content: getSquealContent(document.querySelector("#channel-post-squeal-textarea").value, btn.getAttribute("data-bs-type")),
                        recipients: [{
                            type: "Channel",
                            id: btn.getAttribute("data-bs-channelId")
                        }],
                        fromModerator: true
                    }


                    //insert in table
                    const insertPromise = await fetch("/api/" + table + "/post", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(dataToUpdate)
                    })
                        .then(res => {
                            if (res.ok) {
                                return res.json();
                            } else {
                                console.log("Error while updating data!");
                            }
                        })
                        .then(data => {
                            return loadChannels();  //reload the section to show the new squeal
                        })
                        .catch(err => {
                            console.log(err);
                        });
                }
                break;
        }

        //reload the section
        switch (operationUpdate) {
            case "users":
                await loadUsers();
                break;
            case "channels":
            case "channel-squeal-create":
                //case "channel-squeal-delete":
                await loadChannels();
                break;
            case "squeals":
                await loadSqueals();
                break;
        }
    }

    //change active section
    const userSection = document.getElementById("userSection");
    const channelSection = document.getElementById("channelSection");
    const squealSection = document.getElementById("squealSection");

    //change active section when clicking on the section
    userSection.addEventListener("click", (e) => {
        changeSectionClass(e.target);
    });

    channelSection.addEventListener("click", (e) => {
        changeSectionClass(e.target);

    });

    squealSection.addEventListener("click", (e) => {
        changeSectionClass(e.target);
    });

    //change active section when pressing enter
    userSection.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            changeSectionClass(e.target);
        }
    });

    channelSection.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            changeSectionClass(e.target);
        }
    });

    squealSection.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            changeSectionClass(e.target);
        }
    });



    //SEARCH Listenters
    document.querySelector("#searchBtn").addEventListener("click", async (e) => {
        //prevent the page from reloading
        e.preventDefault();

        //get the value from the input
        const value = document.querySelector("#searchInput").value;

        //get the active section
        const activeSection = document.querySelector(".active-section");


        //the value could either be a @username, a §channel name or an empty string
        //check if the value exists in the db
        switch (value.charAt(0)) {
            case "@": //user
                //set user as active section
                changeSectionClass(userSection);

                loadUsers(value.split('@')[1]);
                break;
            case "§": //channel
                //set channel as active section
                changeSectionClass(channelSection);

                loadChannels(value.split('§')[1]);
                break;
        }
    });

    document.querySelector("#searchInput").addEventListener("input", async (e) => {
        const value = document.querySelector("#searchInput").value;
        if (value === "") {
            //reload the selected section
            const activeSection = document.querySelector(".active-section");
            await loadSection(activeSection);
        }
    });
}


function changeSectionClass(newSection) {
    //before adding the new class, remove the old one
    const activeSection = document.querySelector(".active-section");
    activeSection.classList.remove("active-section");
    activeSection.classList.remove("active-section-not-scrolled");
    activeSection.setAttribute("aria-selected", "false");

    //in the new section, update the attribute for the filter modal
    const btnFilter = document.querySelector("#btn-filter");
    switch (newSection.id) {
        case "userSection":
            btnFilter.setAttribute("data-bs-target", "#userFilterModal");
            break;
        case "channelSection":
            btnFilter.setAttribute("data-bs-target", "#channelFilterModal");
            break;
        case "squealSection":
            btnFilter.setAttribute("data-bs-target", "#squealFilterModal");
            break;
    }

    //update the section
    newSection.classList.add("active-section");
    newSection.classList.add("active-section-not-scrolled");
    newSection.setAttribute("aria-selected", "true");
}

async function usersIdToName(usersId, channelId, dataBsName) {
    let usersName = [];

    for (let i = 0; i < usersId.length; i++) {
        if (usersId[i] === ",") continue;
        console.log(usersId[i]);
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

async function namesToIds(names, div, correctLabel, dataBsId, todo = { user: true, channel: true, keyword: true }, squealId, inputRecipients) {
    // normalize the string for our purpose
    let namesArray = names.trim();//remove spaces
    //namesArray = namesArray.replace(/\s+/g, '');// remove spaces
    namesArray = namesArray.split(",");   // split the string into an array of strings

    let ids = [];

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

    //get all channels from db
    const allChannels = await fetch("/api/channels/allChannels", {
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

    //check if the users exist in the data retrieved from @users and §channels
    for (let i = 0; i < namesArray.length; i++) {
        let found = false;

        if (todo.user) {
            for (let j = 0; j < allUsers.length; j++) {
                if (namesArray[i].split('@')[1] === allUsers[j].name) {
                    ids.push({ type: "User", id: allUsers[j]._id });
                    found = true;
                    break;
                }
            }
        }

        if (todo.channel) {
            for (let j = 0; j < allChannels.length; j++) {
                if (namesArray[i].split('§')[1] === allChannels[j].name) {
                    ids.push({ type: "Channel", id: allChannels[j]._id });
                    found = true;
                    break;
                }
            }
        }

        if (todo.keyword) {
            if (namesArray[i].charAt(0) === "#") {
                ids.push({ type: "Keyword", id: namesArray[i].split('#')[1] });
                found = true;
            }
        }

        //the channel/user could be empty
        if (namesArray[i] === "") {
            found = true;
        }

        if (!found) {
            //set wrong label
            correctLabel.classList.add("text-danger");
            correctLabel.classList.remove("text-success");
            correctLabel.innerHTML = "Wrong name(s)!";
            //inputRecipients.setAttribute("data-bs-recipients-checked", "false");

            return;
        }
    }

    //check for duplicates and remove them
    const idSet = new Set();
    ids = ids.filter((item, index) => {
        // concat the ID and the type to create a unique key
        const key = `${item.type}-${item.id}`;

        // add the key to the set
        if (!idSet.has(key)) {
            idSet.add(key);
            return true;
        }

        return false;
    });

    //update data in input div
    div.setAttribute(dataBsId, formatIdsToAttribute(ids));

    //set correct label
    correctLabel.classList.add("text-success");
    correctLabel.classList.remove("text-danger");
    correctLabel.innerHTML = "Correct name(s)!";
    if (inputRecipients != null) {
        inputRecipients.setAttribute("data-bs-recipients-checked", "true");
    }

    return ids;
}

async function checkIfExistsAndSet(value, input, correctLabel, toId = false, dataBsId, todo = { user: true, channel: true, keyword: true }, dataBsType, squealId = null, inputRecipients = null) {
    let ids = [];
    if (toId) {
        ids = await namesToIds(value, input, correctLabel, dataBsId, todo, squealId, inputRecipients);
    }
    input.value = value;
    if (todo.user && !todo.channel && !todo.keyword) {
        input.setAttribute("data-bs-administrators-name", value);
    } else {
        if (ids) {
            input.setAttribute("data-bs-recipients-name", value);
            input.setAttribute(dataBsType, getIdsType(ids));
        }
    }

    return ids;
}

async function searchAndAddSqueals(squealsId, div) {
    let squealIdArray = squealsId.split(",");
    let geoSqueals = [];

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

        let geo = await addSquealCard(squeal, null, div, true);
        if (geo)
            geoSqueals.push(geo);

        //get all delete squeal btn and add event listener
        const btnDelete = document.querySelectorAll(".channel-squeal-btn");
        for (let i = 0; i < btnDelete.length; i++) {
            btnDelete[i].addEventListener("click", async (e) => {
                await deleteSqueal(e.target.getAttribute("data-bs-squealId"), e);

                //check if squeals are empty
                if (div.innerHTML === "") {
                    div.innerHTML = "<p class='text-center'>No squeals yet!</p>";
                }
            });
        }
    }


    //check if squeals are empty
    if (div.innerHTML === "") {
        div.innerHTML = "<p class='text-center'>No squeals yet!</p>";
    }

    return geoSqueals;

    async function deleteSqueal(squealId, btn) {
        //first, we remove the squeal from the db
        await fetch("/api/squeals/" + squealId, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => {
                if (res.ok) {
                    //now we remove the squeal from the modal
                    const squealCard = btn.target.parentElement.parentElement;
                    //console.log(squealCard);
                    squealCard.outerHTML = "";
                } else {
                    //console.log("Error while deleting squeal!");
                }
            })
            .catch(err => {
                console.log(err);
            });
    }
}


function addSquealCard(squeal, recipients, div, del = false, viewMore = false) {
    //create the card
    let recipientsDiv = '';
    if (recipients != null) {
        //check if some recipients are null
        for (let i = 0; i < recipients.length; i++) {
            if (recipients[i].id == null) {
                //check if it is a channel or a user
                //remove the recipient from the array
                recipients.splice(i, 1);
            }
        }
        recipients.sort((a, b) => (JSON.stringify(a.id.name).toUpperCase > JSON.stringify(b.id.name).toUpperCase) ? -1 : 1);

        recipientsDiv = '<div class="squeal-recipients-div">'
        for (let i = 0; i < recipients.length; i++) {
            if (!recipients[i].id) continue;

            let typeSymbol = '';
            if (recipients[i].type === "Channel") {
                typeSymbol = '§';
            } else if (recipients[i].type === "User") {
                typeSymbol = '@';
            } else if (recipients[i].type === "Keyword") {
                typeSymbol = '#';
            }

            recipientsDiv += '<span class="squeal-recipient ">'
                + typeSymbol + recipients[i].id.name + '</span>';
            if (i < recipients.length - 1)
                recipientsDiv += ', ';
        }
        recipientsDiv += '</div>';

    }
    let header = '<div class="squeal-header d-flex justify-content-between">';
    let ownerDiv = squeal.ownerID ? '<div class="squeal-owner-div p-1 align-self-between">'
        + '<img src="/api/media/' + squeal.ownerID.img + '" alt="' + squeal.ownerID.name + '\'s propic" class="user-pic"/>'
        + '<span class="squeal-owner-name h6 m-2">' + squeal.ownerID.name + '</span>'
        + '</div>'
        :
        '<div class="squeal-owner-div p-1 align-self-between">'
        + '<img src="/deleted.webp" alt="Profile picture" class="user-pic"/>'
        + '<span class="squeal-owner-name h6 m-2">' + 'user deleted' + '</span>'
        + '</div>'
    let datetime = '<div class="squeal-date-div align-self-center text-center">' +
        '<span class="squeal-date">' + formatDate(squeal.datetime) + '</span>'
        + '</div>';
    let automatic = '';
    if (squeal.automatic === true) {
        automatic += '<div class=" w-33 squeal-automatic-div">' +
            '<span class="squeal-automatic"><b>' + (squeal.automatic === true ? 'Automatic' : '') + '</b></span>' +
            '</div>';
    }



    header += ownerDiv;
    header += datetime;
    header += '</div>';

    let content = '<div class="squeal-content">';
    let text = '<p class="squeal-text">' + squeal.content.text + '</p>';
    const imgblobsrc = "/api/media/" + squeal.content.img;
    const videoblobsrc = "/api/media/" + squeal.content.video;
    const alt = "Picture";
    let img = `<div class='d-flex justify-content-center'><img src=${imgblobsrc} alt=${alt} class='img-squeal'/></div>`;


    let video = `<div class='d-flex justify-content-center'><video controls src=${videoblobsrc} class='video-squeal' alt='video'></video></div>`;

    let geolocation = `<div class="geo-squeal-container"><div class="geo-squeal" id=${"map-" + squeal._id}></div></div>`
    let replies = '<div class="squeal-replies">';
    replies += '</div>';

    switch (squeal.type) {
        case "text":
            content += text;
            break;
        case "image":
            content += img;
            break;
        case "video":
            content += video;
            break;
        case "geolocation":
            content += geolocation;
            break;
    }
    content += '</div>';

    let footer = '<div class="squeal-footer">';
    let reactions = '<div class="mb-1 mt-1 squeal-reactions d-flex justify-content-around">'
        + '<div>😡 ' + squeal.reactions.m2 + '</div>'
        + '<div>😒 ' + squeal.reactions.m1 + '</div>'
        + '<div>😄 ' + squeal.reactions.p1 + '</div>'
        + '<div>😝 ' + squeal.reactions.p2 + '</div>'
        + '</span>'
        + '</div>';
    let CM = '<div class="w-33 text-capitalize squeal-cm">'
        + '<span><i>' + squeal.cm.label + '</i></span>'
        + '</div>';
    let impressions = '<div  class="w-33 squeal-impressions text-end">'
        + '<span><i>' + squeal.impressions + '</i>' + ` <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M15 12c0 1.657-1.343 3-3 3s-3-1.343-3-3c0-.199.02-.393.057-.581 1.474.541 2.927-.882 2.405-2.371.174-.03.354-.048.538-.048 1.657 0 3 1.344 3 3zm-2.985-7c-7.569 0-12.015 6.551-12.015 6.551s4.835 7.449 12.015 7.449c7.733 0 11.985-7.449 11.985-7.449s-4.291-6.551-11.985-6.551zm-.015 12c-2.761 0-5-2.238-5-5 0-2.761 2.239-5 5-5 2.762 0 5 2.239 5 5 0 2.762-2.238 5-5 5z"/></svg>` + '</span>'
        + '</div>';
    let controversial = '<div class="squeal-controversial squeal-footer-br">'
        + '<span><i>' + (squeal.controversial === 'true' ? 'Controversial' : 'Not controversial') + '</i></span>'
        + '</div>';

    footer += reactions;
    footer += "<div class='d-flex justify-content-between'>";
    footer += CM;
    footer += automatic
    footer += impressions;
    footer += '</div>';
    //footer += controversial;
    footer += '</div>';
    let btnDelete = '';
    if (del) {
        btnDelete += '<div class="d-flex justify-content-center mt-2"><input type="button" class="channel-squeal-btn btn btn-danger align-self-center" data-bs-squealId="' + squeal._id + '" value="Delete squeal" /></div>';
    }
    let btnViewMore = '';
    if (viewMore) {
        let ownerName = squeal.ownerID ? squeal.ownerID.name : 'user deleted';
        btnViewMore += '<div class="d-flex justify-content-center mt-2"><input type="button" class="channel-squeal-btn btn btn-primary align-self-center" data-bs-squealId="' + squeal._id + '" data-bs-toggle="modal" data-bs-target="#squealModal" value="View more"'
            + 'data-bs-squealOwner="' + ownerName + '"'
            + 'data-bs-squealRecipientsName="' + formatRecipientsForAttribute(squeal.recipients) + '"'
            + 'data-bs-squealReactions-m2="' + squeal.reactions.m2 + '"'
            + 'data-bs-squealReactions-m1="' + squeal.reactions.m1 + '"'
            + 'data-bs-squealReactions-p1="' + squeal.reactions.p1 + '"'
            + 'data-bs-squealReactions-p2="' + squeal.reactions.p2 + '"'
            + 'data-bs-squealRecipientsId="' + formatRecipientsIdsToAttribute(squeal.recipients) + '"'
            + 'data-bs-idsType="' + getIdsType(squeal.recipients) + '"'
            + 'data-bs-squealControversial="' + squeal.controversial + '"'
            + 'data-bs-squealImpressions="' + squeal.impressions + '"'
            + 'data-bs-squealCm="' + squeal.cm.label + '"'
            + 'data-bs-squealAutomatic="' + squeal.automatic + '"'
            + 'data-bs-squealDatetime="' + squeal.datetime + '"'

            + ' /></div>';
    }
    let mycard = "<div class='d-flex justify-content-between flex-column my-card-squeal channel-squeal'>";
    mycard += recipientsDiv;
    mycard += header;
    mycard += content;
    mycard += footer;
    //mycard += automatic;
    mycard += btnDelete;
    mycard += btnViewMore;
    mycard += '</div>'
    div.innerHTML += mycard;

    let geoSqueal = {};
    if (squeal.type === "geolocation") {
        geoSqueal = { geolocation: squeal.content.geolocation, mapId: "map-" + squeal._id }
        //let map = createGeoMap(squeal.content.geolocation, "map-" + squeal._id);
        return geoSqueal;
    }

}


function createGeoMap(geolocation, mapId = null) {
    //check if geolocation.latitude and geolocation.longituted are null
    if (geolocation.latitude === null || geolocation.longitude === null || mapId === null) {
        return '';
    }

    let map = L.map(mapId, {
        center: [geolocation.latitude, geolocation.longitude],
        zoom: 13,
        layers: [
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 20,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }),
            L.marker([geolocation.latitude, geolocation.longitude])
        ]
    }).setView([geolocation.latitude, geolocation.longitude], 13);



    return map;
}

function pad(number) {
    return (number < 10 ? '0' : '') + number;
}

function formatDate(date) {
    const d = new Date(date);
    const month = pad(d.getMonth() + 1); // Aggiungo 1 al mese perché i mesi in JavaScript partono da 0
    const day = pad(d.getDate());
    const year = d.getFullYear();
    const hour = pad(d.getHours());
    const minutes = pad(d.getMinutes());

    return day + "/" + month + "/" + year + " " + hour + ":" + minutes;
}

function formatRecipientsForAttribute(recipients) {
    //we need to format the recipients to be able to put them in the data-bs-* attribute
    //@user,§channel,#keyword
    let recipientsFormatted = '';
    for (let i = 0; i < recipients.length; i++) {
        let typeSymbol = '';
        if (recipients[i].type === "Channel") {
            typeSymbol = '§';
        } else if (recipients[i].type === "User") {
            typeSymbol = '@';
        } else if (recipients[i].type === "Keyword") {
            typeSymbol = '#';
        }

        recipientsFormatted += typeSymbol + recipients[i].id.name;
        if (i < recipients.length - 1)
            recipientsFormatted += ','; //add comma if not last
    }
    return recipientsFormatted;
}

function formatAdmin(admins) {
    if (admins === null || admins === '') return '';
    //we need to format the @admins
    let adminsFormatted = '';
    myadmins = admins.replace(/\s+/g, '').split(",");
    for (let i = 0; i < myadmins.length; i++) {
        adminsFormatted += '@' + myadmins[i];
        if (i < myadmins.length - 1)
            adminsFormatted += ','; //add comma if not last
    }

    return adminsFormatted;
}



function formatRecipientsIdsToAttribute(recipientsIds) {
    let recipientsFormatted = '';
    for (let i = 0; i < recipientsIds.length; i++) {
        recipientsFormatted += recipientsIds[i].id._id;
        if (i < recipientsIds.length - 1)
            recipientsFormatted += ','; //add comma if not last
    }

    return recipientsFormatted;
}

function getIdsType(recipients) {
    //for every recipient, check if it's a channel or a user or a keyword
    let idsType = '';
    for (let i = 0; i < recipients.length; i++) {
        if (recipients[i].type === "Channel") {
            idsType += 'Channel';
        } else if (recipients[i].type === "User") {
            idsType += 'User';
        } else if (recipients[i].type === "Keyword") {
            idsType += 'Keyword';
        }
        if (i < recipients.length - 1)
            idsType += ','; //add comma if not last
    }

    return idsType;
}

function formatIdsToAttribute(ids) {
    //for every ids get only the type
    let idsFormatted = '';
    for (let i = 0; i < ids.length; i++) {
        idsFormatted += ids[i].id;
        if (i < ids.length - 1)
            idsFormatted += ','; //add comma if not last
    }
    return idsFormatted;
}

function getRecipientsFromModal() {
    //id: document.querySelector("#squeal-recipients").getAttribute("data-bs-recipients-id").replace('\n', '').split(','),
    //type: document.querySelector("#squeal-recipients").getAttribute("data-bs-ids-type").replace('\n', '').split(',')
    let recipients = [];
    const ids = document.querySelector("#squeal-recipients").getAttribute("data-bs-recipients-id").replace('\n', '').split(',');
    const types = document.querySelector("#squeal-recipients").getAttribute("data-bs-ids-type").replace('\n', '').split(',');
    const namesForKeywords = document.querySelector("#squeal-recipients").getAttribute("data-bs-recipients-nameKeywords").replace('\n', '').split(',');
    const recipientChecked = document.querySelector("#squeal-recipients").getAttribute("data-bs-recipients-checked");

    for (let i = 0; i < ids.length; i++) {
        if (ids[i] === "") continue;
        if (recipientChecked == "false" && types[i] === "Keyword") {
            recipients.push({ id: namesForKeywords[i].split("#")[1], type: types[i] });
        } else {
            recipients.push({ id: ids[i], type: types[i] });
        }
    }
    return recipients;
}

function getAdminsFromModal() {
    const adminsInput = document.querySelector("#channel-administrators");
    let ids = adminsInput.getAttribute("data-bs-administrators-id");

    let admins = [];
    if (ids != null) {
        ids = ids.replace('\n', '').split(',');
        for (let i = 0; i < ids.length; i++) {
            if (ids[i] === "") continue;
            admins.push(ids[i]);
        }
    }

    return admins;
}

function getSquealContent(value, type) {
    let squealContent = { text: null, image: null, geolocation: null };
    switch (type) {
        case "text":
            squealContent.text = value;
            break;
        case "image":
            squealContent.image = value;
            break;
        case "geolocation":
            squealContent.geolocation = value;
            break;
    }

    return squealContent;
}