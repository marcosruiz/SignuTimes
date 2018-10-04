# Generate private keys for client
openssl genrsa 4096 > ca/private/personalkey.pem
openssl req -new -key ca/private/personalkey.pem -out personalcert.csr -subj "//C=ES\ST=Zaragoza\L=Zaragoza\O=Signu\OU=Signu\CN=SignuPersonal\emailAddress=sobrenombre@gmail.com"

openssl ca -in personalcert.csr -config openssl.cnf -out ca/newcerts/personalcert.pem
cp ca/newcerts/personalcert.pem ca

# It can give problems cause it requires password.
# openssl pkcs12 -export -inkey ca/private/personalkey.pem -in ca/personalcert.pem -certfile ca/cacert.pem  -out ca/private/personal.p12
