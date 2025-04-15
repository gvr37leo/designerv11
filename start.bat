start mongod
timeout 2
@REM start nodemon --inspect server.js
start node server.js
timeout 2
start http://localhost:8000