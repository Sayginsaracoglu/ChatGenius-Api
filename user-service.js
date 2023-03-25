const mongoose = require('mongoose');
const bcrypt =require("bcryptjs");
const dotenv = require('dotenv');

/*CONFIG */
let Schema = mongoose.Schema;
dotenv.config();
let mongoDBConnectionString = process.env.MONGO_DB_CONNECTION_STRING;


let userSchema = new Schema({
    email: {
        type: String,
        unique: true
    },
    password: String,
    role: String
});

let User;
//, { useNewUrlParser: true }
module.exports.connect = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(mongoDBConnectionString);

        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });

        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};


module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        bcrypt.hash(userData.password, 10).then(hash => {

            userData.password = hash;

            let newUser = new User(userData);

            newUser.save().then(() => {
                resolve("User " + userData.email + " successfully registered");  
            }).catch(err => {
                if (err.code == 11000) {
                    reject(`${userData.email} already taken`);
                } else {
                    reject("There was an error creating the user: " + err);
                }
            })
        }).catch(err => reject(err));
    });
};

// module.exports.registerUser = async function (userData) {
//     return  bcryptjs.hash(userData.password, 5)
//         .then((hashedData) => {
//             console.log(hashedData);
//             userData.password = hashedData;

//             const newUser = new User(userData);

//             newUser.save();
//         })
//         .then(() => {
//             console.log("User " + userData.email + " successfully registered");
//             return "User " + userData.email + " successfully registered";
//         })
//         .catch((err) => {
//             if (err.code === 11000) {
//                 throw new Error("Email already taken");
//             } else {
//                 throw new Error("There was an error creating the user: " + err);
//             }
//         });
// };