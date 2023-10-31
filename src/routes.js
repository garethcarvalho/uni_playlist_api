"use strict";

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

    app.post('/api/users', async (req, res) => {
        let username = req.username;
        let password = req.password;

        // Here we will check whether username and password are valid.
        // Check for SQL injections, salt the password, generate userId.

        // Check if user exists.
        let query = 'SELECT count(*) AS userCount FROM Users WHERE Username = ?'
        await database.query(query, [username], (err, result) => {
            if (err) throw err;

            if (parseInt(result[0].userCount) > 0) {
                res.status.send("User already exists with username " + username)
            }
        });


        query = 'INSERT INTO Users (Username, Salt) VALUES (?, ?)'
        await database.query(query, [username, password], (err, result) => {
            if (err) {
                // Error Handling
                // throw err;
                res.status(404).send("User was not able to be created");
                return;
            }

            res.status(200).send("User has been created");
        });
    });
};
