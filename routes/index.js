const express = require('express');
var router = express.Router();
const http = require('http');
const fs = require('file-system');
const ssl = 'openssl.exe';
const path = require('path');
const exec = require('child_process').exec;
var HttpStatus = require('http-status-codes');

const key = path.resolve(__dirname, '../openssl/ca/private/tsakey.pem');
const cert = path.resolve(__dirname, '../openssl/ca/tsacert.pem');
const ca = path.resolve(__dirname, '../openssl/ca/cacert.pem');
const config = path.resolve(__dirname, '../openssl/openssl.cnf');
const crl = path.resolve(__dirname, '../openssl/ca/crl/ca.crl');

router.get('/', function (req, res) {
    res.send('Welcome to Signu TSA');
});
router.post('/tsr', postTSR);

router.get('/example', getExample);

router.get('/ocsp', function (req, res) {
    res.send("Welcome to GET OCSP");
});
router.post('/ocsp', postOCSP);

router.get('/crl', getCRL);

function getCRL(req, res){
    console.log("getCRL");
    //console.log(req.headers);
    res.download(crl, 'ca.crl');
}

var serviceCallback = function (response) {
    return function (err, obj) {
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
function generateTSQuery(logfile, callback) {
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
function generateTSReply(query, callback) {
    const dirname = path.dirname(query);
    const basename = path.basename(query, path.extname(query));
    const reply = path.resolve(dirname, `${basename}.tsr`);

    const cmd = `${ssl} ts -config ${config} -reply -queryfile ${query} -inkey ${key} -signer ${cert} -out ${reply}`;
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
 *  Download a file .tsq
 */
function getExample(req, res) {
    // Creata a .tsq and send it
    generateTSQuery('descarga.pdf', function (err, result) {
        res.header('Content-Type', 'application/timestamp-reply');
        res.header('Content-Disposition', 'attachment; filename=descarga.tsq');
        res.download(result, 'descarga.tsq');
    });
}

/**
 * POST TSR
 * Pre: receives a request using Time-Stamp Protocol (RFC3161)
 * Post: response with a binary file
 */
function postTSR(req, res) {
    // Check header
    if (req.header('content-type') != 'application/timestamp-query') {
        res.status(HttpStatus.BAD_REQUEST).send("Bad Request");
    } else {
        req.on('data', function (data) {
            fs.writeFileSync('file.tsq', data);
        });
        req.on('end', function () {
            const cmd = `${ssl} ts -query -in file.tsq -text`;
            const child2 = exec(cmd, (err, stdout, stderr) => {
                if (err) return callback(err);
            });
            generateTSReply('file.tsq', function (err, reply) {
                res.header('Content-Type', 'application/timestamp-reply');
                if (err) {
                    res.status(500).send("Internal error");
                } else {
                    res.header('Content-Disposition', 'attachment; filename=file.tsr');
                    res.download(reply, 'file.tsr');
                }
            });
        });
    }
}

/**
 * check this with: openssl ocsp
 */
function postOCSP(req, res) {
    if (req.header('content-type') != 'application/ocsp-request') {
        res.status(HttpStatus.BAD_REQUEST).send("Bad Request");
    } else {
        req.on('data', function (data) {
            fs.writeFileSync('file.ocsp', data);
            console.log(data);
        });
        req.on('end', function () {
            console.log("ocsp");
            res.header('content-type', 'application/ocsp-response');
            res.status(200).send("BLA");
        });
    }
}

module.exports = router;
