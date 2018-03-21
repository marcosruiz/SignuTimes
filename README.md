# SignuTimes

With SignuTimes is a Time Stamp Authority Service.

This service uses TSP RFC3161

## How to install service SignuTimes

Sources:

[Stackoverflow - Signing and verifing log files using openssl](https://stackoverflow.com/questions/33881316/node-js-signing-and-verifying-log-files-digitally-using-openssl)

### Install openssl and add it to the classpath

Go to [openssl](https://www.openssl.org/) and install the last version of OpenSSL for your OS.


### Set the structure on point

I recommend use the native command prompt of your OS to follow the following steps with Admin privileges.

You must stay in SignuTimes/routes and create this directory if it does not exist

~~~
mkdir ca
cd ca
mkdir private
mkdir newcerts
touch index.txt
echo 01 > serial
echo 01 > tsaserial
~~~

### Generate a Private and Public Key for my CA

~~~
openssl genrsa 4096 > ca/private/cakey.pem
openssl req -new -x509 -days 3650 -key ca/private/cakey.pem > ca/newcerts/cacert.pem
~~~

If you have this problem: unable to write 'random state'
The solution is: use terminal with admin privileges

~~~
cp ca/newcerts/cacert.pem ca
~~~

### Generate a Private and Public Key for my TSA

~~~
openssl genrsa 4096 > ca/private/tsakey.pem
openssl req -new -key ca/private/tsakey.pem > tsacert.csr
~~~

Before insert the following instructions you have to be sure that the dir variable of openssl.cnf file is correct

~~~
openssl ca -in tsacert.csr -config ./openssl.cnf > ca/newcerts/tsacert.pem
cp ca/newcerts/tsacert.pem ca
~~~
