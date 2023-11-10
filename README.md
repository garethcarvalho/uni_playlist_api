# Universal Playlist API

This is a sample REST API implementation using Express JS and MySQL. The code in the main branch is working with MySQL database. 


## Runing the code

1. Clone the repository 
2. Create a .env file in the root directory with the template given in the .env-template file. The values should specify the host, database, and user and password to connect to your database.
3. npm install
4. npm start


## REST Endpoints

This is a sample documentation. At the time when you check this, the server might not be available to use the endpoint.

BaseURL: https://your-website-address.com/

| Method        | Endpoint           | Parameters  | Description  |
| :-------------: |:-----------| :-------------------: | ---------- |
| GET   | /api/users | None      | Lists all users.              |
| GET   | /api/users | id (Body) | Lists user with specific id.  |
| POST  | /api/users | username (Body) <br> password (Body) <br> email (Body) <br> callType (Body) | Depending on the contents of `callType`, will create a new user, or return a login token. <br> To login: `"callType":"createUser"` <br> To create user: `"callType":"login"`
