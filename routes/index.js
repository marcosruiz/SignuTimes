const express = require('express');
var router = express.Router();
const http = require('http');
const fs = require('file-system');
const ssl = 'openssl';
const path = require('path');
const exec = require('child_process').exec;
var HttpStatus = require('http-status-codes');

const tsakey = path.resolve(__dirname, '../openssl/ca/private/tsakey.pem');
const tsacert = path.resolve(__dirname, '../openssl/ca/tsacert.pem');
const cacert = path.resolve(__dirname, '../openssl/ca/cacert.pem');
// const cakey = path.resolve(__dirname, '../openssl/ca/private/cakey.pem');
const config = path.resolve(__dirname, '../openssl/openssl.cnf');
// const crl = path.resolve(__dirname, '../openssl/ca/crl/ca.crl');
// const crlPem = path.resolve(__dirname, '../openssl/ca/crl/ca.crl.pem');

router.get('/', function (req, res) {
    res.send('Welcome to Signu TSA');
});
router.post('/tsr', postTSR);

router.post('/cert', processCSR);

function processCSR(req, res, next) {
    req.on('data', function (data) {
        fs.writeFileSync('file.csr', data);
    });
    req.on('end', function () {
        generateCSRReply('file.csr', function(err, reply){
            if (err) {
                res.status(500).send("Internal error");
            } else {
                res.header('Content-Disposition', 'attachment; filename=file.pem');
                res.download(reply, 'file.pem');
            }
        });
    });
}

function generateCSRReply(query, callback) {
    const dirname = path.dirname(query);
    const basename = path.basename(query, path.extname(query));
    const reply = path.resolve(dirname, `${basename}.pem`);
    const queryRoute = path.resolve(dirname, `${basename}.csr`);
    // openssl ca -in personalcert.csr -config openssl.cnf -out ca/newcerts/personalcert.pem
    const cmd = `${ssl} ca -batch -in ${queryRoute} -config ${config} -out ${reply}`;
    const child = exec(cmd, (err, stdout, stderr) => {
        if (err) {
            callback(err);
        } else {
            console.log(stdout);
            callback(null, reply);
        }
    });
}
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
    const queryfile = path.resolve(dirname, `${basename}.tsq`);
    const cmd = `${ssl} ts -config ${config} -reply -queryfile ${queryfile} -inkey ${tsakey} -signer ${tsacert} > ${reply}`;
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
 * POST TSR
 * Pre: receives a request using Time-Stamp Protocol (RFC3161)
 * Post: response with a binary file
 */
function postTSR(req, res, next) {
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
                if (err) return next(err);
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


module.exports = router;
