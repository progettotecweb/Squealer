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

const fs = require('fs');
const { MongoClient } = require("mongodb");
const mongoose = require('mongoose');

//read json file
let jsonData = JSON.parse(fs.readFileSync('./db/people.json'));


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

            db.dropCollection('users'); // Elimina la collezione esistente se presente
            console.log('Collection eliminata');

            // Definizione dello schema per le persone
            const personaSchema = new mongoose.Schema({
                nome: String,
                cognome: String,
                età: Number
            });

            const Persona = mongoose.model('Persona', personaSchema);




            try {
                await db.dropCollection('personas'); // Elimina la collezione esistente se presente
                await Persona.insertMany(jsonData.persone); // Inserisce i dati dal JSON
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
    const mongouri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}?writeConcern=majority`;

    let query = {}
    let debug = []
    let data = { query: q[fieldname], result: null }
    try {
        debug.push(`Trying to connect to MongoDB with user: '${credentials.user}' and site: '${credentials.site}' and a ${credentials.pwd.length}-character long password...`)
        const mongo = new MongoClient(mongouri);
        await mongo.connect();
        debug.push("... managed to connect to MongoDB.")

        debug.push(`Trying to query MongoDB with query '${q[fieldname]}'... `)
        let result = []
        query[fieldname] = { $regex: q[fieldname], $options: 'i' }
        await mongo.db(dbname)
            .collection(collection)
            .find(query)
            .forEach((r) => {
                result.push(r)
            });
        debug.push(`... managed to query MongoDB. Found ${result.length} results.`)

        data.result = result
        await mongo.close();
        debug.push("Managed to close connection to MongoDB.")

        data.debug = debug
        if (q.ajax) {
            return data
        } else {
            return out
        }
    }
    catch (e) {
        e.debug = debug
        return e
    }
}