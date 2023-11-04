
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



    async function loadUsers() {
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

                //create the cards for every user
                for (let i = 0; i < data.length; i++) {
                    let mycard = "<div class='my-card'>";

                    const blobsrc = "data:" + data[i].img.mimetype + ";base64," + data[i].img.blob;
                    let img = "<img src='" + blobsrc + "' alt='" + data[i].name + "'s propic' class='user-pic'/>";
                    mycard += img;
                    mycard += '<div class="user-content">';
                    let username = "<p class='user-name'>" + data[i].name + "</p>";

                    mycard += username;
                    mycard += "</div>";
                    let userInfoDataBs = 'data-bs-userId="' + data[i]._id + '" data-bs-toggle="modal" data-bs-target="#userModal" data-bs-username="'
                        + data[i].name + '" data-bs-userimg="' + blobsrc + '" data-bs-quota_daily="' + data[i].msg_quota.daily
                        + '"data-bs-quota_monthly="' + data[i].msg_quota.monthly + '" data-bs-quota_weekly="' + data[i].msg_quota.weekly
                        + '" data-bs-quota_extra="' + data[i].msg_quota.extra + '"' + 'data-bs-blocked="' + data[i].blocked + '"';
                    let btn = '<input type="button" class="user-btn btn btn-primary"' + userInfoDataBs + ' value="View more" />';
                    mycard += btn;
                    mycard += "</div>";
                    boxContent.innerHTML += mycard;
                }

                //return data;
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
            const modalBody = userModal.querySelector('.modal-body')

            modalTitle.textContent = databs.username
            modalImg.src = databs.img
            modalBody.textContent = `Quota giornaliera: ${databs.quota.daily} Quota settimanale: ${databs.quota.weekly} \n Quota mensile: ${databs.quota.monthly} \n Quota extra: ${databs.quota.extra}`
        })
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
    //before adding the new class i remove the old one
    const activeSection = document.querySelector(".active-section");
    activeSection.classList.remove("active-section");

    //update the section
    newSection.classList.add("active-section");
}