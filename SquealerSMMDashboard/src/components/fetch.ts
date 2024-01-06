// fetch.js
//import { ref } from 'vue'



export async function getUserData() {
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
            //signout();
        });
    return userInfo;
}


export async function getMyData(url: string) {
    const userInfo = await fetch("/api/users/" + url, {
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
            //signout();
        });
    return userInfo;
}

export async function getMyDataAndPopulate(url: string) {
    const userInfo = await fetch("/api/users/squeals/" + url, {
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
            //signout();
        });
    return userInfo;
}