const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// Get All players
app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `
    SELECT *
    FROM cricket_team `;
  const team = await db.all(getAllPlayersQuery);
  response.send(
    team.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

// Add Player to Database
app.use(express.json());

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO 
    cricket_team 
    (
        player_name, 
        jersey_number, 
        role
    )
    VALUES
    (
        '${playerName}', 
        ${jerseyNumber}, 
        '${role}'
    );`;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//Get Player Details

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuery = `
    SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId};`;
  const playerDetails = await db.get(getPlayerDetailsQuery);
  response.send(convertDbObjectToResponseObject(playerDetails));
});

// Update Player Details

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetailsQuery = `
  UPDATE
  cricket_team
  SET 
  player_name = '${playerName}',
  jersey_number = ${jerseyNumber},
  role = '${role}'
  WHERE 
  player_id = ${playerId};`;
  db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});

// Delete player from database

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
    cricket_team
    WHERE 
    player_id = ${playerId};`;
  db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
