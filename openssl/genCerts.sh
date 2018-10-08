# Generate a Private and Public Key for my CA
cd ca
rm index.txt
touch index.txt
echo 01 > serial
echo 01 > tsaserial
cd ..

openssl genrsa -out ca/private/cakey.pem 4096
openssl req -new -x509 -days 3650 -key ca/private/cakey.pem -out ca/newcerts/cacert.pem -subj "/C=ES/ST=Zaragoza/L=Zaragoza/O=Signu/OU=Signu/CN=SignuCA/emailAddress=signu.app@gmail.com"
cp ca/newcerts/cacert.pem ca

# Generate a Private and Public Key for my TSA
openssl genrsa 4096 > ca/private/tsakey.pem
openssl req -new -key ca/private/tsakey.pem -out tsacert.csr -subj "/C=ES/ST=Zaragoza/L=Zaragoza/O=Signu/OU=Signu/CN=SignuTSA/emailAddress=signu.app@gmail.com"
openssl ca -in tsacert.csr -config openssl.cnf -out ca/newcerts/tsacert.pem
cp ca/newcerts/tsacert.pem ca

# Generate private keys for client
openssl genrsa 4096 > ca/private/personalkey.pem
openssl req -new -key ca/private/personalkey.pem -out personalcert.csr -subj "/C=ES/ST=Zaragoza/L=Zaragoza/O=Signu/OU=Signu/CN=SignuPersonal/emailAddress=sobrenombre@gmail.com"

// It needs user interaction
openssl ca -in personalcert.csr -config openssl.cnf -out ca/newcerts/personalcert.pem
cp ca/newcerts/personalcert.pem ca

# It can give problems cause it requires password.
# openssl pkcs12 -export -inkey ca/private/personalkey.pem -in ca/personalcert.pem -certfile ca/cacert.pem  -out ca/private/personal.p12

# Generate Certificate Revocation List (CRL)
cd ca
echo 01 > crlnumber
cd ..
openssl ca -config openssl.cnf -gencrl -out ca/crl/ca.crl.pem
openssl crl -inform PEM -in ca/crl/ca.crl.pem -outform DER -out ca/crl/ca.crl

# Example revoke
# openssl ca -config openssl.cnf -revoke ca/personalcert.pem -keyfile ca/private/cakey.pem -cert ca/cacert.pem