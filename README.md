# Universal Playlist API

This is a sample REST API implementation using Express JS and MySQL. The code in the main branch is working with MySQL database. 


## REST Endpoints

This is a sample documentation. At the time when you check this, the server might not be available to use the endpoint.

BaseURL: https://your-website-address.com/

| Method        | Endpoint           | Parameters  | Description  |
| :-------------: |:-----------| :-------------------: | ---------- |
| GET   | /api/users | None      | Lists all users.              |
| GET   | /api/users | id (Body) | Lists user with specific id.  |
| POST  | /api/users | username (Body) <br> password (Body) <br> email (Body) <br> callType (Body) | Depending on the contents of `callType`, will create a new user, or return a login token. <br> To login: `"callType":"createUser"` <br> To create user: `"callType":"login"`|
| GET   | /api/playlists |  loginToken (Body) | Returns the list of playlists by the account that is associated with the login token. |
| GET   | /api/playlists/:playlistGuid | playlistGuid (URL) <br> loginToken (Body) | Returns a playlist with a specific GUID.
