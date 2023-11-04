
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

    const userInfo = await fetch("/api/searchUserById?id=" + userSession.id, {
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
    document.getElementById("user-name").innerHTML = userInfo.nome;
    const blobsrc = "data:" + userInfo.img.mimetype + ";base64," + userInfo.img.blob;
    document.getElementById("user-img").src = blobsrc;

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

    function loadUsers() {
        
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