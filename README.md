# SignuTimes

[![Build Status](https://travis-ci.com/marcosruiz/SignuTimes.svg?branch=master)](https://travis-ci.com/marcosruiz/SignuTimes)

With SignuTimes is a Time Stamp Authority Service.

This service uses [TSP RFC3161](https://www.ietf.org/rfc/rfc3161.txt)

## How to install service SignuTimes

Sources:

[Stackoverflow - Signing and verifing log files using openssl](https://stackoverflow.com/questions/33881316/node-js-signing-and-verifying-log-files-digitally-using-openssl)

### Install openssl and add it to the classpath

Go to [openssl](https://www.openssl.org/) and install the last version of OpenSSL for your OS.


### Set the structure on point

I recommend use the native command prompt of your OS to follow the following steps with Admin privileges or Git bash

You must stay in SignuTimes/ and create this directory if it does not exist

~~~
mkdir openssl
cd openssl
mkdir ca
cd ca
mkdir private
mkdir newcerts
touch index.txt
echo 01 > serial
echo 01 > tsaserial
cd ..
~~~

### Warning

Copy openssl.cnf of `C:\Program Files\Git\mingw64\ssl` to openssl/ and edit this line `# extendedKeyUsage/` into this `extendedKeyUsage/` and edit dir to `./ca`.
Edit [tsa_config1]:

- In `dir` put TSA absolute root directory
- In `digest` put sha256 and every digest that you use

Edit [ca_config]:

- In `dir` put CA absolute root directory

### Generate a Private and Public Key for my TSA

~~~
openssl genrsa 4096 > ca/private/tsakey.pem
openssl req -new -key ca/private/tsakey.pem -out tsacert.csr -subj "/C=ES/ST=Zaragoza/L=Zaragoza/O=Signu/OU=Signu/CN=Signu/emailAddress=signu.app@gmail.com"
~~~

Before insert the following instructions you have to be sure that the dir variable of openssl.cnf file is correct

~~~
openssl ca -in tsacert.csr -config openssl.cnf -out ca/newcerts/tsacert.pem
cp ca/newcerts/tsacert.pem ca
~~~

# Update .gitignore

~~~
git rm -r --cached .
git add .
git commit -m "fixed untracked files"
~~~
