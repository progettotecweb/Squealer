/* 
File: mongo.js 
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

const { query } = require('express');
const fs = require('fs');
const { MongoClient } = require("mongodb");
const mongoose = require('mongoose');

//read json file
let jsonData = JSON.parse(fs.readFileSync('./db/people.json'));

// Definizione dello schema per le persone
const userSchema = new mongoose.Schema({
    nome: String,
    password: String,
    ruolo: String,
    quota_msg: {
        giorno: Number,
        settimana: Number,
        mensile: Number,
        extra: Number,
    },
    popolarità: Number,
    post: [
        {
            post_id: Number,
            visibility: String,
            destinatari: {
                canale_id: [String],
                user_id: [Number],
                keyword: [String],
            },
            reactions: {
                '-2': Number,
                '-1': Number,
                '+1': Number,
                '+2': Number,
            },
            contains: {
                text: {
                    exist: Boolean,
                    descrizione: String,
                    length: Number,
                },
                img: [
                    {
                        exist: Boolean,
                        blob: String, 
                        descrizione: String,
                    },
                ],
                video: [
                    {
                        exist: Boolean,
                        blob: String, 
                        descrizione: String,
                    },
                ],
                geo: {
                    exist: Boolean,
                    coordinates: {
                        x: Number,
                        y: Number,
                    },
                },
            },
            impression: Number,
            CM: {
                'R+': Number,
                'R-': Number,
                label: {
                    popolare: Boolean,
                    impopolare: Boolean,
                },
            },
            datetime: {
                year: Number,
                month: Number,
                day: Number,
                time: {
                    $numberLong: String,
                },
            },
            controverso: Boolean,
            automatico: Boolean,
            risposte: {
                user_id: Number,
                text: String,
            },
        },
    ],
});

//const fs = require('fs').promises;

exports.connect = async function (credentials) {
    connectToDB(credentials);
}

function connectToDB(credentials) {
    const uri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;

    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('Connected to MongoDB...'))
        .catch(err => console.error('Could not connect to MongoDB...', err));
}

exports.create = async function (credentials) {
    //const mongouri = mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority; 

    let uri = `mongodb://${credentials.site}/db`;

    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(async () => {
            console.log('Connected to MongoDB')
            const db = mongoose.connection;

            const User = mongoose.model('User', userSchema);

            try {
                await db.dropCollection('users'); // Elimina la collezione esistente se presente
                await User.insertMany(jsonData); // Inserisce i dati dal JSON
                console.log('Database popolato con successo');
            } catch (err) {
                console.error('Errore durante la popolazione del database:', err);
            } finally {
                mongoose.disconnect(); // Chiudi la connessione al database
            }
        })
        .catch(err => console.error('Could not connect to MongoDB', err));
}


exports.search = async function (q, credentials) {
    let uri = `mongodb://${credentials.site}/db`;

    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(async () => {
            console.log('Connected to MongoDB')
            const db = mongoose.connection;

            const User = mongoose.model('User', userSchema);

            let query = {};

            //cerco i campi che mi sono stati passati, se li trovo li aggiungo alla query
            

            try {
                const persone = await User.find(query);
                console.log(persone);
                return persone;
            } catch (err) {
                console.error('Errore durante la ricerca:', err);
            } finally {
                mongoose.disconnect(); // Chiudi la connessione al database
            }

            console.log(query);

        })


        .catch(err => console.error('Could not connect to MongoDB', err));

}