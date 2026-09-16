const bcrypt = require("bcryptjs");

const password = "admin123";

bcrypt.hash(password, 10, (err, hash) => {

    if (err) {
        console.error(err);
        return;
    }

    console.log(hash);
});