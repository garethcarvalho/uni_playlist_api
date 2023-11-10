"use strict";

const UNDEFINED = "undefined";

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
        let status = "";
        let message = "";

        // Check if username and password are defined.
        if (req.body.username ===  undefined || req.body.password === undefined || req.body.email === undefined) {
            status = "Unsuccessful";
            message = "Username, email, and password must be defined.";

            res.status(404).send(`${status}: ${message}`).end();
            return; // Early return if either are undefined.
        }

        let username = req.body.username;
        let password = req.body.password;
	    let email = req.body.email;

        // We should also make sure the username and password aren't SQL injections.
        // if (username is SQL injection || password is SQL injection) {
        //    return;
        // }

        const checkQuery = database.query(
            'SELECT COUNT(*) AS userCount FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        
        // Check for existing user.
        const check = await checkQuery;
        if (check[0].userCount != 0) {
            status = "Unsuccessful";
            message = "User already exists with that username or email";
            res.status(404).send(`${status}: ${message}`).end();
            return;
        }
      
        // Insert User into Table.
        const createUserQuery = database.query(
            'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            [username, password, email]
        );
        
        const results = await createUserQuery;
        status = "Successful";
        message = `User with the username "${username}" has been created.`;
        res.status(200).send(`${status}: ${message}`).end();
    });

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
        let statusMsg = "";

        switch (callType) {
            case 'login':
                statusMsg = loginUser(username, password, email);
                break;
            case 'createUser':
                statusMsg = createUser(username, password, email);
                break;
            default:
                statusMsg = [404, 'callType is invalid. Use "callType":"login" to login, or "calltype":"createUser" to create a new user'];
        }

        res.status(statusMsg[0]).send(statusMessage[1]).end();

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

    // api for logging in
    // app.post('/api/users', async (req, res) => {
    //     let username = req.query.username;
    //     let password = req.query.password;

    //     let status = "";
    //     let message = "";

    //     // Check if username and password are defined.
    //     if (typeof username == UNDEFINED || typeof password == UNDEFINED) {
    //         status = "Unsuccessful";
    //         message = "Both username and password must be defined."

    //         req.status(404).send(`${status}: ${message}`).end();
    //         return; // Early return if either are undefined.
    //     }

    //     // We should also make sure the username and password aren't SQL injections.
    //     // if (username is SQL injection || password is SQL injection) {
    //     //    return;
    //     // }

    //     // check to see if password is correct.
    //     const getPassword = database.query(
    //         'SELECT password FROM Users WHERE Username = ?',
    //         [username]
    //     );

    //     // use bcrypt to decode password and see if it is correct
    //     if bcrypt.checkpw (password.encode('utf-8'), getPassword.encode('utf-8')){
    //         status = "Successful";
    //         message = "password correct";
    //         res.status(200).send(`$status: ${message}`).end();
    //     } else {
    //         status = "Successful";
    //         message = "password incorrect";
    //         res.status(401).send(`$status: ${message}`).end();
    //     }
        
        
    // });

};

async function loginUser(username, password, email, database) {
    const checkQuery = database.query(
        'SELECT COUNT(*) AS userCount FROM users WHERE username = ? AND email = ?',
        [username, email]
    );
    
    // Check for existing user.
    const check = await checkQuery;
    if (check[0].userCount == 0) {
        return [404, "Username or Email is invalid"];
    }

    // Query for the userId and create the login token.
    const uuid = crypto.randomUUID();
    const userQuery = database.query(
        'SELECT id FROM users WHERE username = ? AND email = ?',
        [username, email]
    );

    const userId = await userQuery;
    return [200, JSON.stringify(userId)];
}

async function createUser(username, password, email) {
}
