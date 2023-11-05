"use strict";

const UNDEFINED = "undefined";

module.exports.register = (app, database) => {

    app.get('/', async (req, res) => {
        res.status(200).send("This is running!").end();
    });

    app.get('/api/resources', async (req, res) => {
        let query;
        query = database.query('SELECT * FROM rest_emp');

        const records = await query;

        res.status(200).send(JSON.stringify(records)).end();
    });

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

        // Check if user already exists.
        if (parseInt(check[0].userCount) != 0) {
            status = "Unsuccessful";
            message = "User already exists with the username: " + username;
            req.status(404).send(`${status}: ${message}`).end();
            return; // Early return if user already exists.
        }

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
};
