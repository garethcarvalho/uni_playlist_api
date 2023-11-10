"use strict";

const { v4: uuidv4 } = require('uuid');

module.exports.register = (app, database) => {

    app.get('/', async (req, res) => {
        res.status(200).send("This is running!").end();
    });

    app.get('/api/users', async (req, res) => {
        let query;
        if (req.body.id) {
            let id = req.body.id;
            query = database.query(
                'SELECT * FROM users WHERE id = ?',
                [id]
            );
        } else {
            query = database.query('SELECT * FROM users');
        }

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
        // Check if username and password are defined.
        if (req.body.username ===  undefined || req.body.password === undefined || req.body.email === undefined) {
            res.status(404).send('Username, email, and password must be defined.').end();
            return; // Early return if either are undefined.
        }

        if (req.body.callType === undefined) {
            res.status(404).send('callType is undefined. Use "callType":"login" to login, or "calltype":"createUser" to create a new user').end();
            return;
        }

        let username = req.body.username;
        let password = req.body.password;
        let email = req.body.email;

        const callType = req.body.callType;
        let statusMsg;

        switch (callType) {
            case 'login':
                statusMsg = await loginUser(username, password, email, database);
                break;
            case 'createUser':
                statusMsg = await createUser(username, password, email, database);
                break;
            default:
                statusMsg = [404, 'callType is invalid. Use "callType":"login" to login, or "calltype":"createUser" to create a new user'];
        }

        res.status(statusMsg[0]).send(statusMsg[1]).end();

    });

    app.get('/api/playlists', async (req, res) => {
        let message = "";
        let status = "";

        // Check if login token is valid
        if (typeof req.body.loginToken === undefined) {
            status = "Unsuccessful";
            message = "User is not logged in or their login token is invalid."
            res.status(404).send(`${status}: ${message}`).end();
            return;
        }

        let loginToken = req.body.loginToken;
        
        const userIdQuery = database.query(
            'SELECT user_id AS userId FROM login_tokens WHERE guid = ?',
            [loginToken]
        );

        const userIdResults = await userIdQuery;
        if (userIdResults[0] === undefined) {
            status = "Unsuccessful";
            message = "User is not logged in or their login token is invalid."
            res.status(404).send(`${status}: ${message}`).end();
            return;
        }

        const userId = userIdResults[0].userId;

        const playlistsQuery = database.query(
            'SELECT * FROM playlists WHERE owner_id = ?',
            [userId]
        );

        const playlistObj = await playlistsQuery;
        res.status(200).send(JSON.stringify(playlistObj)).end();
    });
};

/**
 * Logs in a user with the associated username, password, and email. If any of these are
 * invalid, the log in attempt will fail.
 * @param {string} username - username of user to be logged in
 * @param {string} password - password of user to be logged in
 * @param {string} email - email of user to be logged in
 * @param {*} database - universal_playlist database
 * @returns Status Message where [0] is the status code, and [1] is the message. On a
 * successful login, the message will be the login token.
 */
async function loginUser(username, password, email, database) {
    console.log(`${username} ${password} ${email}`);
    const checkQuery = database.query(
        'SELECT COUNT(*) AS userCount FROM users WHERE username = ? AND email = ? AND password = ?',
        [username, email, password]
    );
    
    // Check for existing user.
    const check = await checkQuery;
    if (check[0].userCount == 0) {
        return [404, "Username or Email is invalid"];
    }

    // Query for the userId.
    const userQuery = database.query(
        'SELECT id FROM users WHERE username = ? AND email = ? AND password = ?',
        [username, email, password]
    );
    
    const userIdResults = await userQuery;
    // Create the login token.
    const loginToken = uuidv4();

    const tokenQuery = database.query(
	    'INSERT INTO login_tokens (token_guid, user_id) VALUES (?, ?)',
	    [loginToken, userIdResults[0].id]
    );
    
    let message = `{"token":"${loginToken}"}`
    return [200, message];
}

async function createUser(username, password, email, database) {
    const checkQuery = database.query(
        'SELECT COUNT(*) AS userCount FROM users WHERE username = ? OR email = ?',
        [username, email]
    );
    
    // Check for existing user.
    const check = await checkQuery;
    if (check[0].userCount != 0) {
        return [404, "User already exists with that username or email."];
    }
    
    // Insert User into Table.
    const createUserQuery = database.query(
        'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
        [username, password, email]
    );
    
    const results = await createUserQuery;
    return loginUser(username, password, email, database);
}