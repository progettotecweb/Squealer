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
    //add data-bs master user id
    document.getElementById("master-user-name").setAttribute("data-bs-master_user_id", userInfo._id);
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
    sectionList.addEventListener("click", async (e) => {
        if (e.target.classList.contains("box-section")) {
            await loadSection(e.target);
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
                loadSqueals();
                break;
        }
    }



    async function loadUsers(showSelf = true) {
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

                //create the cards for every user
                for (let i = 0; i < data.length; i++) {
                    //check the filter type and skip the user if it doesn't match, or show all
                    if (filter.type != "All" && data[i].role != filter.type) continue;

                    //check if the user is the moderator and if he wants to see himself
                    let mycard = "<div class='my-card my-card-grid-tl-tr-b'>";

                    const blobsrc = "data:" + data[i].img.mimetype + ";base64," + data[i].img.blob;
                    let img = "<img src='" + blobsrc + "' alt='" + data[i].name + "'s propic' class='user-pic my-card-grid-tl'/>";
                    mycard += img;
                    mycard += '<div class="user-content my-card-grid-tr">';
                    let content = "<p class='user-name h5'>" + data[i].name + "</p>";
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
                }

                //return data;
            })
            .catch(err => {
                console.log(err);
            });
    }


    async function loadChannels(waitForNewSqueal = false, squeal = null) {
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
                }

                //create the cards for every channel
                for (let i = 0; i < data.length; i++) {
                    //check the filter type and skip the channel if it doesn't match, or show all
                    if (filter.type != "All" && (data[i].official === true ? 'Official' : 'Unofficial') != filter.type) continue;

                    let mycard = "<div class='my-card my-card-grid-t-c12-b'>";

                    let name = '<div class="h5 channel-name my-card-grid-top2 text-center w-100">' + data[i].name + '</div>';
                    let description = '<div class="channel-description my-card-grid-center2 text-center w-100">' + data[i].description + '</div>';
                    let officialandowner = '<div class = "my-card-grid-b1"><div class="channel-official">' + (data[i].official === true ? "Official" : "Unofficial") + '</div>'
                        + '<div class = "channel-owner">' + (data[i].owner_id === null ? "" : ('Owner: ' + data[i].owner_id.name)) + '</div></div>';
                    let followers = '<div class = "channel-followers my-card-grid-b2">' + data[i].followers.length + ' Follower(s)</div>';
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
                        + 'data-bs-channelSqueals="' + data[i].squeals + '"'
                        + 'data-bs-master_user_id="' + document.querySelector('#master-user-name').getAttribute("data-bs-master_user_id") + '"';

                    //setChannelSquealsAttributes(data[i]._id, "data-bs-channelSqueals");
                    let btnChannel_squeals = '<input type="button" class="m-1 channel-btn btn btn-secondary align-self-end" ' + channelSquealsInfoDataBs + ' value="Squeals" />';
                    let footer = '<div class="card-channel-footer my-card-grid-bottom d-flex justify-content-center">' + btn + btnChannel_squeals + '</div></div>';
                    mycard += footer;
                    mycard += "</div>";
                    boxContent.innerHTML += mycard;
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
                /*switch (filter.orderBy) {
                    case "date":
                        data.sort((a, b) => {
                            if (a.date < b.date) {
                                return 1;
                            }
                            if (a.date > b.date) {
                                return -1;
                            }
                            return 0;
                        });
                        break;
                }*/

                //create the cards for every squeal
                //console.log(data)
                for (let i = 0; i < data.length; i++) {
                    addSquealCard(data[i], data[i].recipients, boxContent, false, true);
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
            //reset check admins label and checkbox
            const checkAdmins = channelModal.querySelector("#channel-administrators-checkbox");
            checkAdmins.checked = false;
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
        checkAdmins.addEventListener("change", async (e) => {
            if (checkAdmins.checked) {
                const correctLabel = document.querySelector("#channel-administrators-label");
                checkIfExistsAndSet(inputAdmins.value, inputAdmins, correctLabel, true, "data-bs-administrators-id", { user: true, channel: false });
            }
            else {
                //reset check admins label and checkbox
                const correctLabel = document.querySelector("#channel-administrators-label");
                correctLabel.classList.remove("text-danger");
                correctLabel.classList.remove("text-success");
                correctLabel.innerHTML = "Insert @username(s) separated by a comma";
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
        correctLabel.innerHTML = "Insert @username(s) separated by a comma";
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

            const viewSquealsDiv = channelSquealsModal.querySelector(".channel-view-squeals");
            viewSquealsDiv.innerHTML = "";

            //create the cards for every squeal
            searchAndAddSqueals(databs.squeals, viewSquealsDiv);

            const btnSave = channelSquealsModal.querySelector("#btn-savechanges");
            btnSave.setAttribute("data-bs-channelId", databs.id);
            btnSave.setAttribute("data-bs-operation", "channel-squeal-create");
        });
    }

    //reset values when modal is closed
    channelSquealsModal.addEventListener('hidden.bs.modal', () => {
        //reset textarea
        const textarea = channelSquealsModal.querySelector("#channel-post-squeal-textarea");
        textarea.value = "";

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
                idsType: button.getAttribute('data-bs-idsType')
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

            const btnSave = squealsModal.querySelector("#btn-savechanges");

            //set input values
            owner.innerHTML = databs.owner;
            inputRecipients.value = databs.recipients;
            inputReactions.m2.value = databs.reactions.m2;
            inputReactions.m1.value = databs.reactions.m1;
            inputReactions.p1.value = databs.reactions.p1;
            inputReactions.p2.value = databs.reactions.p2;
            inputRecipients.setAttribute("data-bs-recipients-id", databs.recipientsId);
            inputRecipients.setAttribute("data-bs-ids-type", databs.idsType);

            //recipients
            //reset check admins label and checkbox
            const checkRecipients = squealsModal.querySelector("#channel-recipients-checkbox");
            checkRecipients.checked = false;
            const correctLabel = document.querySelector("#channel-recipients-label");
            correctLabel.classList.remove("text-danger");
            correctLabel.classList.remove("text-success");
            correctLabel.innerHTML = "Insert @usernames and §channels names separated by a comma";

            //add event listener to the recipients input
            // const inputRecipients = squealsModal.querySelector("#squeal-recipients");
            //const checkRecipients = squealsModal.querySelector("#squeal-recipients-checkbox");
            checkRecipients.addEventListener("change", async (e) => {
                if (checkRecipients.checked) {
                    const correctLabel = document.querySelector("#channel-recipients-label");
                    checkIfExistsAndSet(inputRecipients.value, inputRecipients, correctLabel, true, "data-bs-recipients-id", { user: true, channel: true }, "data-bs-ids-type");
                }
                else {
                    console.log("unchecked")
                    //reset check admins label and checkbox
                    const correctLabel = document.querySelector("#channel-recipients-label");
                    correctLabel.classList.remove("text-danger");
                    correctLabel.classList.remove("text-success");
                    correctLabel.innerHTML = "Insert @usernames and §channels names separated by a comma";
                }
            });

            btnSave.setAttribute("data-bs-squealId", databs.id);
            btnSave.setAttribute("data-bs-operation", "squeals")
        })


        //reset values when modal is closed
        squealsModal.addEventListener('hidden.bs.modal', () => {
            //reset checkbox 
            const checkRecipients = squealsModal.querySelector("#channel-recipients-checkbox");
            checkRecipients.checked = false;
            //reset check admins label and checkbox
            const correctLabel = document.querySelector("#channel-recipients-label");
            correctLabel.classList.remove("text-danger");
            correctLabel.classList.remove("text-success");
            correctLabel.innerHTML = "Insert @usernames and §channels names separated by a comma";
        });
    }

    //save changes if button is pressed, add event listener to every button
    const btnSave = document.getElementsByClassName("btn-savechanges");
    for (let i = 0; i < btnSave.length; i++) {
        btnSave[i].addEventListener("click", async (e) => {
            //console.log(e.target)
            await updateDBandSection(e.target);
        });
    }

    //USER FILTER MODAL
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
                            administrators: document.querySelector("#channel-administrators").value != '' ? document.querySelector("#channel-administrators").getAttribute("data-bs-administrators-id").replace('\n', '').split(',') : null,
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
                break;

            case "CREATE":
                if (operationUpdate === "channel-squeal-create" && document.querySelector("#channel-post-squeal-textarea").value != '') {//create squeal
                    //retrieve data to update from modal
                    let dataToUpdate = {
                        ownerID: document.querySelector("#master-user-name").getAttribute("data-bs-master_user_id"),
                        content: document.querySelector("#channel-post-squeal-textarea").value,
                        recipients: [{
                            type: "Channel",
                            id: btn.getAttribute("data-bs-channelId")
                        }]
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
                //console.log("newId: " + newId);
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
            btnFilter.setAttribute("data-bs-target", "#squealsFilterModal");
            break;
    }

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

async function namesToIds(names, div, correctLabel, dataBsId, todo = { user: true, channel: true }) {
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

        if (!found) {
            //set wrong label
            correctLabel.classList.add("text-danger");
            correctLabel.classList.remove("text-success");
            correctLabel.innerHTML = "Wrong name(s)!";

            return;
        }
    }

    //console.log(usersId);
    //update data in input div
    div.setAttribute(dataBsId, formatIdsToAttribute(ids));

    //set correct label
    correctLabel.classList.add("text-success");
    correctLabel.classList.remove("text-danger");
    correctLabel.innerHTML = "Correct name(s)!";

    return ids;
}

async function checkIfExistsAndSet(value, input, correctLabel, toId = false, dataBsId, todo = { user: true, channel: true }, dataBsType) {
    let ids = [];
    if (toId) {
        ids = await namesToIds(value, input, correctLabel, dataBsId, todo);
    }
    input.value = value;
    if (todo.user && !todo.channel) {
        input.setAttribute("data-bs-administrators-name", value);
    } else {
        input.setAttribute("data-bs-recipients-name", value);
        input.setAttribute(dataBsType, getIdsType(ids));
    }

    return ids;
}

async function searchAndAddSqueals(squealsId, div) {
    let squealIdArray = squealsId.split(",");
    //console.log(squealIdArray);
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
                console.log(data);
                return data;
            })
            .catch(err => {
                console.log(err);
            });

        console.log(squealIdArray);
        await addSquealCard(squeal, null, div, true);

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

    async function deleteSqueal(squealId, btn) {
        //console.log(squealId);
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
        recipientsDiv = '<div class="squeal-recipients-div align-self-center">'
        for (let i = 0; i < recipients.length; i++) {
            recipientsDiv += '<span class="squeal-recipient ">'
                + (recipients[i].type === "Channel" ? '§' : '@')
                + recipients[i].id.name + '</span>';
            if (i < recipients.length - 1)
                recipientsDiv += ', ';
        }
        recipientsDiv += '</div>';

    }
    let header = '<div class="squeal-header d-flex justify-content-between">';
    let ownerDiv = '<div class="squeal-owner-div p-1 align-self-between">'
        + '<img src="data:' + squeal.ownerID.img.mimetype + ';base64,' + squeal.ownerID.img.blob + '" alt="' + squeal.ownerID.name + '\'s propic" class="user-pic"/>'
        + '<span class="squeal-owner-name h6 m-2">' + squeal.ownerID.name + '</span>'
        + '</div>';
    let datetime = '<div class="squeal-date-div align-self-center text-center">' +
        '<span class="squeal-date">' + formatDate(squeal.datetime) + '</span>'
        + '</div>';
    let automatic = '';
    if (squeal.automatic === true) {
        automatic += '<div class="squeal-automatic-div align-self-center text-center">' +
            '<span class="squeal-automatic"><b>' + (squeal.automatic === true ? 'Automatic' : '') + '</b></span>' +
            '</div>';
    }



    header += ownerDiv;
    header += datetime;
    header += '</div>';

    let content = '<div class="squeal-content">';
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
    let btnDelete = '';
    if (del) {
        btnDelete += '<div class="d-flex justify-content-center mt-2"><input type="button" class="channel-squeal-btn btn btn-danger align-self-center" data-bs-squealId="' + squeal._id + '" value="Delete squeal" /></div>';
    }
    let btnViewMore = '';
    if (viewMore) {
        btnViewMore += '<div class="d-flex justify-content-center mt-2"><input type="button" class="channel-squeal-btn btn btn-primary align-self-center" data-bs-squealId="' + squeal._id + '" data-bs-toggle="modal" data-bs-target="#squealModal" value="View more"'
            + 'data-bs-squealOwner="' + squeal.ownerID.name + '"'
            + 'data-bs-squealRecipientsName="' + formatRecipientsForAttribute(squeal.recipients) + '"'
            + 'data-bs-squealReactions-m2="' + squeal.reactions.m2 + '"'
            + 'data-bs-squealReactions-m1="' + squeal.reactions.m1 + '"'
            + 'data-bs-squealReactions-p1="' + squeal.reactions.p1 + '"'
            + 'data-bs-squealReactions-p2="' + squeal.reactions.p2 + '"'
            + 'data-bs-squealRecipientsId="' + formatRecipientsIdsToAttribute(squeal.recipients) + '"'
            + 'data-bs-idsType="' + getIdsType(squeal.recipients) + '"'
            + ' /></div>';
    }
    let mycard = "<div class='my-card-squeal channel-squeal'>";
    mycard += recipientsDiv;
    mycard += header;
    mycard += content;
    mycard += footer;
    mycard += automatic;
    mycard += btnDelete;
    mycard += btnViewMore;
    mycard += '</div>'
    div.innerHTML += mycard;
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

async function postSqueal(squeal, btn) {
    console.log(squeal);
    await fetch("/api/squeals/post", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(squeal)
    })
        .then(res => {
            if (res.ok) {
                //console.log("Squeal posted!");
            } else {
                console.log("Error while posting squeal!");
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function formatRecipientsForAttribute(recipients) {
    //we need to format the recipients to be able to put them in the data-bs-* attribute
    //@user,§channel
    let recipientsFormatted = '';
    for (let i = 0; i < recipients.length; i++) {
        recipientsFormatted += (recipients[i].type === "Channel" ? '§' : '@') + recipients[i].id.name;
        if (i < recipients.length - 1)
            recipientsFormatted += ','; //add comma if not last
    }
    return recipientsFormatted;
}

function formatAdmin(admins) {
    if (admins === null) return '';
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
    //for every recipient, check if it's a channel or a user
    let idsType = '';
    for (let i = 0; i < recipients.length; i++) {
        idsType += recipients[i].type === "Channel" ? 'Channel' : 'User';
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

    for (let i = 0; i < ids.length; i++) {
        recipients.push({ id: ids[i], type: types[i] });
    }

    return recipients;
}