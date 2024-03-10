const express = require("express");
const path = require("path");
const cors = require("cors");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjeToResponseObj = (dbObj) => {
  return {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
    jerseyNumber: dbObj.jersey_number,
    role: dbObj.role,
  };
};
//Returns list of players in the team
app.get("/players/", async (request, response) => {
  const getPlayers = `SELECT * FROM  cricket_team;`;
  const cricketArray = await db.all(getPlayers);
  response.send(
    cricketArray.map((eachPlayer) => convertDbObjeToResponseObj(eachPlayer))
  );
});

//Creates a new player in the team
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `INSERT INTO 
                             cricket_team (player_name,jersey_number,role)
                             values ('${playerName}', ${jerseyNumber}, '${role}');`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//Player based on playerID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `SELECT * FROM cricket_team
                        WHERE player_id= ${playerId}`;
  const player = await db.get(playerQuery);
  response.send(convertDbObjeToResponseObj(player));
});

//Updates details of player
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayer = `UPDATE cricket_team
                            SET 
                            player_name='${playerName}',
                            jersey_number=${jerseyNumber},
                            role='${role}'
                            WHERE player_id= ${playerId};`;
  await db.run(updatePlayer);
  response.send("Player Details Updated");
});
//Deletes a player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `DELETE FROM cricket_team 
                            WHERE player_id= ${playerId};`;
  await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
