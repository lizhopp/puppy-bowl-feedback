// === Constants ===
const BASE = "https://fsa-puppy-bowl.herokuapp.com/api/";
const COHORT = "2511-HELEN/"; // Make sure to change this!
const API = BASE + COHORT;

// === State ===
let players = [];
let selectedPlayer;
let teams = [];

/** Updates state with all players from the API */
async function getPlayers() {
  try {
    const response = await fetch(API + "players");
    const result = await response.json();
    players = result.data.players;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single player from the API */
async function getPlayer(id) {
  try {
    const response = await fetch(API + "players/" + id);
    const result = await response.json();
    selectedPlayer = result.data.player;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all teams from the API -- not sure if I need this yet */
async function getTeams() {
  try {
    const response = await fetch(API + "teams");
    const result = await response.json();
    teams = result.data.teams;
    render();
  } catch (e) {
    console.error(e);
  }
}

// add player to the API and update state with the new list of players
async function addPlayer(player) {
  try {
    const response = await fetch(API + "players/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(player),
    });
    await getPlayers();
  } catch (e) {
    console.error(e);
  }
}

// delete player from the API and update state with the new list of players
async function deletePlayer(id) {
  try {
    const response = await fetch(API + "players/" + id, {
      method: "DELETE",
    });
    selectedPlayer = undefined;
    await getPlayers();
  } catch (e) {
    console.error(e);
  }
}

// === Components ===

/** Player name that shows more details about the player when clicked */
function playerProfile(player) {
  const $li = document.createElement("li");

  if (player.id === selectedPlayer?.id) {
    $li.classList.add("selected");
  }

  // href supports anchor links too, like for selected player name here
  $li.innerHTML = `
    <a href="#selected">
      <img 
        src="${player.imageUrl}" 
        alt="${player.name}" 
        width="100"
      />
      <div>${player.name}</div>
    </a>
  `;
  $li.addEventListener("click", () => getPlayer(player.id));
  return $li;
}

/** A list of names of all players */
function roster() {
  const $ul = document.createElement("ul");
  $ul.classList.add("players");

  const $players = players.map(playerProfile);
  $ul.replaceChildren(...$players);

  return $ul;
}

/** Detailed information about the selected player */
function SelectedPlayer() {
  if (!selectedPlayer) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a puppy to learn more.";
    return $p;
  }

  const team = teams.find((t) => t.id === selectedPlayer.teamId);

  const $player = document.createElement("section");
  $player.innerHTML = `
        <img 
      src="${selectedPlayer.imageUrl}" 
      alt="${selectedPlayer.name}" 
      width="250"
        />
    <p><strong>Name & ID:</strong> ${selectedPlayer.name} #${selectedPlayer.id}</p>
    <p><strong>Breed:</strong> ${selectedPlayer.breed}</p>
    <p><strong>Status:</strong> ${selectedPlayer.status}</p>
    <p><strong>Team:</strong> ${team ? team.name : "Unassigned"}</p>

    <button>Remove from roster</button>
  `;

  const $delete = $player.querySelector("button");
  $delete.addEventListener("click", () => deletePlayer(selectedPlayer.id));

  return $player;
}

// form that allows users to input details about a new player
function NewPlayerForm() {
  const $form = document.createElement("form");
  $form.innerHTML = ` 
  <label> 
    Name
    <input name="name" type="text" required>
  </label>
  <label>
    Breed
    <input name="breed" type="text" required>
  </label>
  <label>
    Status
    <select name="status">
      <option value="bench" selected>Bench</option>
      <option value="field">Field</option>
    </select>
  </label>
  <label>
    Image URL
    <input name="imageUrl" type="text">
  </label>

  <button type="submit">Invite puppy</button>
  `;

  $form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData($form);
    addPlayer({
      name: data.get("name"),
      breed: data.get("breed"),
      status: data.get("status"),
      imageURL: data.get("imageUrl"),
      teamId: data.get("teamId"), // fix this, should be randomly selected between teams pulled from API
    });
  });

  return $form;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Puppy Bowl</h1>
    <main>
      <section>
        <h2>Puppy Bowl Roster</h2>
        <Roster></Roster>
      </section>
      <section id="selected">
        <h2>Player Details</h2>
        <SelectedPlayer></SelectedPlayer>
      </section>
      <section>
        <h2>Create a New Player</h2>
        <NewPlayerForm></NewPlayerForm>
      </section>
    </main>
  `;

  $app.querySelector("Roster").replaceWith(roster());
  $app.querySelector("NewPlayerForm").replaceWith(NewPlayerForm());
  $app.querySelector("SelectedPlayer").replaceWith(SelectedPlayer());
}

async function init() {
  await getPlayers();
  await getTeams();
  await roster();
  render();
}

init();
