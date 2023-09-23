/*
File: index.js
Author: Fabio Vitali
Version: 1.0 
Last change on: 10 April 2021


Copyright (c) 2021 by Fabio Vitali

   Permission to use, copy, modify, and/or distribute this software for any
   purpose with or without fee is hereby granted, provided that the above
   copyright notice and this permission notice appear in all copies.

   THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
   SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
   OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
   CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

*/



/* ========================== */
/*                            */
/*           SETUP            */
/*                            */
/* ========================== */

global.rootDir = __dirname;
global.startDate = null;


const express = require('express');
const cors = require('cors')
const path = require('path');
const mymongo = require('./db/mongo.js');

/* NEXT CONFIG */
const next = require('next')
const dev = process.env.NODE_ENV !== 'production'
const config = require('./SquealerApp/next.config.js')
const appNext = next({dev, customServer: true, conf: config, dir: './SquealerApp'})
const handle = appNext.getRequestHandler()


appNext.prepare().then(() => {


/* ========================== */
/*                            */
/*  EXPRESS CONFIG & ROUTES   */
/*                            */
/* ========================== */

let app = express();
app.use('/js', express.static(global.rootDir + '/public/js'));
app.use('/css', express.static(global.rootDir + '/public/css'));
app.use('/data', express.static(global.rootDir + '/public/data'));
app.use('/docs', express.static(global.rootDir + '/public/html'));
app.use('/img', express.static(global.rootDir + '/public/media'));
app.use(express.urlencoded({ extended: true }))
app.use(cors())

//app.use("/Home", express.static(path.join(__dirname, "SquealerApp", "dist")));
app.use("/SMM", express.static(path.join(__dirname, "SquealerSMMDashboard", "dist")));
app.use("/Moderator", express.static(path.join(__dirname, "SquealerModeratorDashboard")));

// https://stackoverflow.com/questions/40459511/in-express-js-req-protocol-is-not-picking-up-https-for-my-secure-link-it-alwa
app.enable('trust proxy');


app.get('/', async function (req, res) {
	res.redirect('/Home')
})

app.get("/SMM/*", async function (req, res) {
	res.sendFile(path.join(__dirname, "SquealerSMMDashboard", "dist", "index.html"));
})

app.get("/Moderator/*", async function (req, res) {
	res.sendFile(path.join(__dirname, "SquealerModeratorDashboard", "index.html"));
})

const info = async function (req, res) {
	let data = {
		startDate: global.startDate.toLocaleString(),
		requestDate: (new Date()).toLocaleString(),
		request: {
			host: req.hostname,
			method: req.method,
			path: req.path,
			protocol: req.protocol
		},
		query: req.query,
		body: req.body
	}
	res.send(await template.generate('info.html', data));
}

app.get('/info', info)
app.post('/info', info)

/** API */
app.get("/api/account", async function(req, res) {
	res.json({
		"username": "admin",
		"password": "admin"
	})
})

/* ========================== */
/*                            */
/*           MONGODB          */
/*       using mongoose       */
/* ========================== */

/* Replace these info with the ones you were given when activating mongoDB */
const mongoCredentials = {
	user: "",
	pwd: "",
	site: "127.0.0.1:27017"
}
/* end */


app.get('/db/create', async function (req, res) {
	res.send(await mymongo.create(mongoCredentials))
});
app.get('/db/search', async function (req, res) {
	res.send(await mymongo.search(req.query, mongoCredentials))
});
app.get('/db/connect', async function (req, res) {
	res.send(await mymongo.connect(mongoCredentials))
});

app.get('*', (req, res) => {
	return handle(req, res)
})


/* 404 */

app.use(function(req, res, next) {
	res.status(404).sendFile(path.join(__dirname, "public","html", "404.html"));
})


/* ========================== */
/*                            */
/*    ACTIVATE NODE SERVER    */
/*                            */
/* ========================== */


app.listen(8000, function () {
	global.startDate = new Date();
	console.log(`App listening on port 8000 started ${global.startDate.toLocaleString()}`)
})

}).catch((ex) => {
	console.error(ex.stack)
	process.exit(1)
})

/*       END OF SCRIPT        */
