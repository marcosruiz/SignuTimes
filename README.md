# SignuTimes

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

### Generate a Private and Public Key for my CA

~~~
openssl genrsa -out ca/private/cakey.pem 4096
openssl req -new -x509 -days 3650 -key ca/private/cakey.pem -out ca/newcerts/cacert.pem -subj "/C=ES/ST=Zaragoza/L=Zaragoza/O=Signu/OU=Signu/CN=Signu/emailAddress=signu.app@gmail.com"
~~~

If you have this problem: unable to write 'random state'
The solution is: use terminal with admin privileges

~~~
cp ca/newcerts/cacert.pem ca
~~~

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

# SignuOCSP

## What it is an OCSP

Instead using a CRT (Certificate Revocation List) we are going to use a service OCSP (Online Certificate Status Protocol) to know if a certificate is valid or is revoked.
Because its more effective, with OCSP we can check only one certificate without download all CRT.

This service uses RFC2560 which specification is in this [link](https://www.ietf.org/rfc/rfc2560.txt).

~~~
openssl req -config ./openssl.cnf -new -nodes -out ca.csr -keyout ca.key -extensions v3_ocsp -subj "/C=ES/ST=Zaragoza/L=Zaragoza/O=Signu/OU=Signu/CN=Signu/emailAddress=signu.app@gmail.com"
openssl ca -config ./openssl.cnf -in tsacert.csr -out ca.crt -extensions v3_ocsp
openssl req -config ./openssl.cnf  -new -nodes -out dummy.csr -keyout dummy.key -subj "/C=ES/ST=Zaragoza/L=Zaragoza/O=Signu/OU=Signu/CN=Signu/emailAddress=signu.app@gmail.com"
openssl ca -config ./openssl.cnf -in dummy.csr -out dummy.crt
openssl ocsp -index index.txt -port 8888 -CA cacert.pem -rsigner ca.crt -rkey ca.key -text -out log.txt
openssl ocsp -index /etc/pki/CA/index.txt -port 8888 -rsigner ca.isrlabs.net.crt -rkey ca.isrlabs.net.key -CA /etc/pki/CA/cacert.pem -text -out log.txt
~~~

# Update .gitignore

~~~
git rm -r --cached .
git add .
git commit -m "fixed untracked files"
~~~

# Certificate Revocation List (CRL)

First we create some things:
~~~
cd ca
echo 01 > crlnumber
mkdir crl
cd ..
~~~

With this we create a CRL and check it:
~~~
openssl ca -config openssl.cnf -gencrl -out ca/crl/ca.crl
openssl crl -in ca/crl/ca.crl -noout -text
~~~