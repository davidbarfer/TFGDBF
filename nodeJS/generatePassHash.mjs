import bcrypt from 'bcrypt';

const password = 'DoctusLitePassword';

const hash = bcrypt.hashSync(password, 12);
console.log(hash);

// $2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW
