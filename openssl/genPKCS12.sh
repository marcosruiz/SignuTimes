## Generate private keys for client
# openssl genrsa 4096 > ca/private/personalkey.pem
# openssl req -new -key ca/private/personalkey.pem -out personalcert.csr -subj "/C=ES/ST=Zaragoza/L=Zaragoza/O=Signu/OU=Signu/CN=SignuPersonal/emailAddress=sobrenombre@gmail.com"

# openssl ca -in personalcert.csr -config openssl.cnf -out ca/newcerts/personalcert.pem
# cp ca/newcerts/personalcert.pem ca

# It can give problems cause it requires password.
# openssl pkcs12 -export -inkey ca/private/personalkey.pem -in ca/personalcert.pem -certfile ca/cacert.pem  -out ca/private/personal.p12


## Generate Personal Key 2
# openssl genrsa 4096 > ca/private/personal2key.pem
openssl req -new -key ca/private/personal2key.pem -out personal2cert.csr -subj "/C=ES/ST=Zaragoza/L=Zaragoza/O=Signu/OU=Signu/CN=SignuPersonal2/emailAddress=sobrenombre@gmail.com"

# openssl ca -in personal2cert.csr -config openssl.cnf -out ca/newcerts/personal2cert.pem
# cp ca/newcerts/personal2cert.pem ca

# openssl pkcs12 -export -inkey ca/private/personal2key.pem -in ca/personal2cert.pem -certfile ca/cacert.pem  -out ca/private/personal2.p12
