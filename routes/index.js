'use strict';

const express = require('express');
var router = express.Router();
const http = require('http');
const asn1js = require('asn1js');
const fs = require('file-system');
const crypto = require('crypto');
// const hasher = crypto.createHash('sha256');
// const ssl = 'C:/Program Files/Git/mingw64/bin/openssl.exe';
const ssl = 'openssl.exe';
const path = require('path');
const exec = require('child_process').exec;

const key = path.resolve(__dirname, 'ca/private/tsakey.pem');
const cert = path.resolve(__dirname, 'ca/tsacert.pem');
const ca = path.resolve(__dirname, 'ca/cacert.pem');
const config = path.resolve(__dirname, 'openssl.cnf');


var serviceCallback = function(response){
    return function(err, obj){
        console.log(response);
        if (err) {
            response.send(500);
        } else {
            response.send(obj);
        }
    }
};

/**
 * Source: https://stackoverflow.com/questions/33881316/node-js-signing-and-verifying-log-files-digitally-using-openssl
 * @param logfile
 * @param callback
 */
function generateQuery(logfile, callback) {
    const dirname = path.dirname(logfile);
    const basename = path.basename(logfile, path.extname(logfile));
    const query = path.resolve(dirname, `${basename}.tsq`);

    const cmd = `${ssl} ts -query -data ${logfile} > ${query}`;
    const child = exec(cmd, (err, stdout, stderr) => {
        if (err) return callback(err);

        // no stdout

        const cmd = `${ssl} ts -query -in ${query} -text`;
        const child2 = exec(cmd, (err, stdout, stderr) => {
            if (err) return callback(err);
            callback(null, query);
        })
    })

}

/**
 * Source: https://stackoverflow.com/questions/33881316/node-js-signing-and-verifying-log-files-digitally-using-openssl
 * @param query
 * @param callback
 */
function generateReply(query, callback) {
    const dirname = path.dirname(query);
    const basename = path.basename(query, path.extname(query));
    const reply = path.resolve(dirname, `${basename}.tsr`);

    const cmd = `${ssl} ts -config ${config} -reply -queryfile ${query} -inkey ${key} -signer ${cert} > ${reply}`;
    const child = exec(cmd, (err, stdout, stderr) => {
        if (err) return callback(err);

        const cmd = `${ssl} ts -reply -in ${reply} -text`;
        const child2 = exec(cmd, (err, stdout, stderr) => {
            if (err) return callback(err);
            // console.log(stdout);
            callback(null, reply);
        });
    })
}

/**
 *  GET /example
 *  Download a file
 */
router.get('/example', function(req, res, next) {
    // // Create a file
    // var file = fs.writeFileSync('file.tsr','Lorem ipsum dolor sit amet');

    // Creata a .tsq and send it
    generateQuery('C:/Users/Marcos/WebstormProjects/SignuTimes/bin/descarga.pdf', function(err, result){
        res.header('Content-Type' , 'application/timestamp-reply');
        res.header('Content-Disposition', 'attachment; filename=file.tsr');
        res.download(result, 'descarga.tsq');
    } );

    // Checking descarga.tsq
    // const cmd = `${ssl} ts -query -in descarga2.tsq -text`;
    // const child2 = exec(cmd, (err, stdout, stderr) => {
    //     if (err) return callback(err);
    //     res.send('hola');
    // })
});

/**
 *  GET /
 *  Download a file
 */
router.get('/', function(req, res, next) {
    // Creata a .tsq and send it
    generateQuery('C:/Users/Marcos/WebstormProjects/SignuTimes/bin/descarga.pdf', function(err, result){
        res.send('Welcome to Signu TSA');
    } );
});


/**
 * POST
 * Pre: receives a request using Time-Stamp Protocol (RFC3161)
 * Post: response with a binary file
 */
router.post('/', function(req, res, next){
    req.headers;

    req.on('data', function(data){
        fs.writeFileSync('file.tsq', data);
    });
    req.on('end', function(){
        const cmd = `${ssl} ts -query -in file.tsq -text`;
        const child2 = exec(cmd, (err, stdout, stderr) => {
            if (err) return callback(err);
        });
        generateReply('C:/Users/Marcos/WebstormProjects/SignuTimes/bin/prueba2.tsq',function(err, reply){
            res.header('Content-Type' , 'application/timestamp-reply');
            res.header('Content-Disposition', 'attachment; filename=file.tsr');
            res.download(reply, 'file.tsr');
        });
    });
});

module.exports = router;
