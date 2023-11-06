"use strict";

const UNDEFINED = "undefined";

module.exports.register = (app, database) => {

    app.get('/', async (req, res) => {
        res.status(200).send("This is running!").end();
    });

    // app.get('/api/resources', async (req, res) => {
    //     let query;
    //     query = database.query('SELECT * FROM rest_emp');

    //     const records = await query;

    //     res.status(200).send(JSON.stringify(records)).end();
    // });

    /**
     * Route to create a new Universal Playlist user.
     * @param {string} username - The username for the new user. Must be a username
     * that doesn't already exist.
     * @param {string} password - The password for the new user. Is salted and then
     * stored in the database if the new user is successfully created.
     */
    app.post('/api/users', async (req, res) => {
        let username = req.query.username;
        let password = req.query.password;

        let status = "";
        let message = "";

        // Check if username and password are defined.
        if (typeof username == UNDEFINED || typeof password == UNDEFINED) {
            status = "Unsuccessful";
            message = "Both username and password must be defined."

            req.status(404).send(`${status}: ${message}`).end();
            return; // Early return if either are undefined.
        }

        // We should also make sure the username and password aren't SQL injections.
        // if (username is SQL injection || password is SQL injection) {
        //    return;
        // }

        const checkQuery = database.query(
            'SELECT COUNT(*) AS userCount FROM Users WHERE Username = ?',
            [username]
        );

        const check = await checkQuery;

      

        // Insert User into Table.
        const createUserQuery = database.query(
            'INSERT INTO Users (Username, Salt) VALUES (?, ?)',
            [username, password]
        );
        
        const results = await createUserQuery;
        status = "Successful";
        message = `User with the username "${username}" has been created.`;
        res.status(200).send(`$status: ${message}`).end();
    });


    // api for logging in
    app.post('/api/users', async (req, res) => {
        let username = req.query.username;
        let password = req.query.password;

        let status = "";
        let message = "";

        // Check if username and password are defined.
        if (typeof username == UNDEFINED || typeof password == UNDEFINED) {
            status = "Unsuccessful";
            message = "Both username and password must be defined."

            req.status(404).send(`${status}: ${message}`).end();
            return; // Early return if either are undefined.
        }

        // We should also make sure the username and password aren't SQL injections.
        // if (username is SQL injection || password is SQL injection) {
        //    return;
        // }

        // check to see if password is correct.
        const getPassword = database.query(
            'SELECT password FROM Users WHERE Username = ?',
            [username]
        );

        // use bcrypt to decode password and see if it is correct
        if bcrypt.checkpw (password.encode('utf-8'), getPassword.encode('utf-8')){
            status = "Successful";
            message = "password correct";
            res.status(200).send(`$status: ${message}`).end();
        } else {
            status = "Successful";
            message = "password incorrect";
            res.status(401).send(`$status: ${message}`).end();
        }
        
        
    });

};
