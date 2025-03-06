// ---------- GLOBAL VARIABLES FOR SELECTION ----------
let selectedSeason = null;
let selectedRound = null;
let selectedRaceName = "";

// ---------- GLOBAL VARIABLES FOR VISUALIZATION ----------
let allDrivers = {};       // driverId => { driverId, givenName, familyName, constructorId, grid }
let totalDrivers = 0;
let raceData = [];         // Processed lap-by-lap race ordering with events
let currentLapIndex = 0;
let driversPositions = {}; // driverId => { x, y } for animation

// ---------- DOM ELEMENT REFERENCES ----------
const seasonSelect = document.getElementById("seasonSelect");
const raceSelect = document.getElementById("raceSelect");
const startRaceButton = document.getElementById("startRaceButton");
const raceTitleDiv = document.getElementById("raceTitle");
const canvas = document.getElementById("raceCanvas");
const ctx = canvas.getContext("2d");
const eventLog = document.getElementById("eventLog");

// ---------- VISUALIZATION CONSTANTS ----------
const driverX = canvas.width / 2;      // Driver bubbles are horizontally centered.
const leaderboardMargin = 100;         // Left side leaderboard margin.

// ---------- TEAM COLORS (drivers from same team share a color) ----------
const teamColors = {
    red_bull: "#000080",
    mercedes: "#00d2be",
    ferrari: "#DC0000",
    mclaren: "#FF8700",
    sauber: "#9e2237",
    aston_martin: "#01665e",
    alpine: "#f2c1e6",
    alphatauri:"#011220",
    williams:"#059cdd",
    haas:"#7a8489",
    rb: "#2328f4",
    toro_rosso:"#2328f4",
    renault: "#f5ec4b",
    racing_point:"#f7b9f0",
    force_india: "#f7b9f0"
};

// ---------- BACKGROUND ANIMATION ----------
// We animate the background offset to simulate a scrolling background.
const bg = { offset: 0 };
gsap.to(bg, { offset: 50, duration: 2, repeat: -1, ease: "linear", onUpdate: drawRace });

// ---------- UTILITY FUNCTIONS ----------
function parseLapTime(lapTimeStr) {
  const parts = lapTimeStr.split(':');
  if (parts.length !== 2) return 0;
  const minutes = parseFloat(parts[0]);
  const seconds = parseFloat(parts[1]);
  return minutes * 60 + seconds;
}

function buildPitStopEvents(pitStops) {
  const eventsByLap = {};
  pitStops.forEach(ps => {
    const lapNum = parseInt(ps.lap);
    if (!eventsByLap[lapNum]) {
      eventsByLap[lapNum] = [];
    }
    eventsByLap[lapNum].push(`Pit Stop: ${ps.driverId}`);
  });
  return eventsByLap;
}

function buildPositionMap(positionsArray) {
  const map = {};
  positionsArray.forEach((item, index) => {
    map[item.driver] = index + 1;
  });
  return map;
}

function getLaneY(lane) {
  const topMargin = 50;
  const bottomMargin = 50;
  const availableHeight = canvas.height - topMargin - bottomMargin;
  const laneHeight = availableHeight / totalDrivers;
  return topMargin + (lane - 0.5) * laneHeight;
}

// ---------- BUILD RACE DATA ----------
// Process raw lap data and pit stops into a lap-by-lap ordering.
function buildRaceData(laps, pitStops) {
  const raceData = [];
  const cumulativeTimes = {}; // driverId => total time (seconds)
  const pitStopEvents = buildPitStopEvents(pitStops);
  
  // Ensure laps are sorted in ascending order.
  laps.sort((a, b) => parseInt(a.number) - parseInt(b.number));
  
  laps.forEach(lap => {
    const lapNum = parseInt(lap.number);
    // Update cumulative lap times.
    lap.Timings.forEach(timing => {
      const driver = timing.driverId;
      const lapSeconds = parseLapTime(timing.time);
      cumulativeTimes[driver] = (cumulativeTimes[driver] || 0) + lapSeconds;
    });
    
    // Active drivers (with a lap time).
    const activeDrivers = lap.Timings.map(t => t.driverId);
    const activeArray = activeDrivers.map(driverId => ({
      driver: driverId,
      totalTime: cumulativeTimes[driverId]
    }));
    activeArray.sort((a, b) => a.totalTime - b.totalTime);
    
    // Drivers not active (e.g. retired) appear after active drivers.
    const nonActiveArray = Object.keys(allDrivers)
      .filter(driverId => !activeDrivers.includes(driverId))
      .sort((a, b) => allDrivers[a].grid - allDrivers[b].grid)
      .map(driverId => ({ driver: driverId, totalTime: Infinity }));
    
    const sortedDrivers = activeArray.concat(nonActiveArray);
    const positions = sortedDrivers.map((item, index) => ({
      driver: item.driver,
      pos: index + 1
    }));
    const events = pitStopEvents[lapNum] || [];
    
    raceData.push({
      lap: lapNum,
      positions,
      events
    });
  });
  
  return raceData;
}

// ---------- INITIALIZE DRIVER POSITIONS ----------
// Based on the ordering from the first lap.
function initDriversPositions(lapData) {
  const posMap = buildPositionMap(lapData.positions);
  Object.keys(allDrivers).forEach(driverId => {
    const pos = posMap[driverId] || allDrivers[driverId].grid || totalDrivers;
    driversPositions[driverId] = {
      x: driverX,
      y: getLaneY(pos)
    };
  });
}

// ---------- DRAWING FUNCTIONS ----------
function drawBackground() {
  const spacing = 50;
  ctx.save();
  ctx.fillStyle = "#333";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 1;
  // Draw vertical lines that scroll using bg.offset.
  for (let x = -spacing; x < canvas.width + spacing; x += spacing) {
    const offsetX = x - bg.offset;
    ctx.beginPath();
    ctx.moveTo(offsetX, 0);
    ctx.lineTo(offsetX, canvas.height);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLeaderboard(currentPositions) {
  ctx.font = "16px Arial";
  ctx.textAlign = "left";
  const startX = 10;
  currentPositions.forEach(item => {
    const pos = item.pos;
    const driverId = item.driver;
    const driverInfo = allDrivers[driverId];
    const y = getLaneY(pos);
    ctx.fillStyle = "#fff";
    ctx.fillText(pos, startX, y + 5);
    // Show only the first 3 letters of the driver's last name.
    const shortName = driverInfo.familyName.substring(0, 3).toUpperCase();
    ctx.fillText(shortName, startX + 30, y + 5);
  });
}

function drawTimeline() {
  const timelineY = canvas.height - 30;
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(leaderboardMargin, timelineY);
  ctx.lineTo(canvas.width - 50, timelineY);
  ctx.stroke();
  
  const totalLaps = raceData.length;
  const startX = leaderboardMargin;
  const endX = canvas.width - 50;
  const gap = (endX - startX) / (totalLaps - 1);
  for (let i = 0; i < totalLaps; i++) {
    const x = startX + i * gap;
    ctx.beginPath();
    ctx.arc(x, timelineY, 5, 0, Math.PI * 2);
    ctx.fillStyle = (i === currentLapIndex) ? "#ff0" : "#fff";
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Lap " + (i + 1), x, timelineY + 20);
  }
}

function drawLapIndicator() {
  const currentLap = raceData[currentLapIndex] ? raceData[currentLapIndex].lap : '';
  ctx.fillStyle = "#fff";
  ctx.font = "32px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Lap " + currentLap + " / " + raceData.length, canvas.width / 2, 40);
}

function drawRace() {
  drawBackground();
  
  // Draw horizontal lane lines.
  for (let i = 1; i <= totalDrivers; i++) {
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1;
    ctx.beginPath();
    const y = getLaneY(i);
    ctx.moveTo(leaderboardMargin, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  
  if (raceData[currentLapIndex]) {
    drawLeaderboard(raceData[currentLapIndex].positions);
  }
  
  // Draw driver bubbles.
  Object.keys(driversPositions).forEach(driverId => {
    const pos = driversPositions[driverId];
    const team = allDrivers[driverId].constructorId;
    const color = teamColors[team] || "#fff";
    
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.stroke();
    
    // Display the abbreviated (3-letter) last name in the bubble.
    const shortName = allDrivers[driverId].familyName.substring(0, 3).toUpperCase();
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(shortName, pos.x, pos.y);
  });
  
  drawTimeline();
  drawLapIndicator();
}

// ---------- ANIMATION FUNCTIONS ----------
function getTargetPositions(lapPositions) {
  const targetMap = {};
  lapPositions.forEach(item => {
    targetMap[item.driver] = {
      pos: item.pos,
      y: getLaneY(item.pos),
      x: driverX
    };
  });
  Object.keys(allDrivers).forEach(driverId => {
    if (!targetMap[driverId]) {
      const gridPos = allDrivers[driverId].grid || totalDrivers;
      targetMap[driverId] = {
        pos: gridPos,
        y: getLaneY(gridPos),
        x: driverX
      };
    }
  });
  return targetMap;
}

function animateLapTransition(lapData) {
  const targets = getTargetPositions(lapData.positions);
  const duration = 1.5; // seconds
  
  Object.keys(targets).forEach(driverId => {
    if (driversPositions[driverId]) {
      gsap.to(driversPositions[driverId], {
        duration: duration,
        y: targets[driverId].y,
        ease: "power2.inOut",
        onUpdate: drawRace
      });
    } else {
      driversPositions[driverId] = { x: targets[driverId].x, y: targets[driverId].y };
    }
  });
}

// Run the full race using a GSAP timeline.
function runRace() {
  const tl = gsap.timeline();
  raceData.forEach((lapData, index) => {
    tl.call(() => {
      currentLapIndex = index;
      if (lapData.events.length > 0) {
        eventLog.innerText = "Lap " + lapData.lap + " Events: " + lapData.events.join(", ");
      } else {
        eventLog.innerText = "Lap " + lapData.lap;
      }
      animateLapTransition(lapData);
    });
    tl.to({}, { duration: 3 });
  });
}

// ---------- FETCH FUNCTIONS (PARAMETERIZED) ----------
function fetchRaceResults(season, round) {
  const url = `https://ergast.com/api/f1/${season}/${round}/results.json?limit=1000`;
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      const race = data.MRData.RaceTable.Races[0];
      race.Results.forEach(result => {
        const driver = result.Driver;
        const constructorId = result.Constructor.constructorId;
        allDrivers[driver.driverId] = {
          driverId: driver.driverId,
          givenName: driver.givenName,
          familyName: driver.familyName,
          constructorId: constructorId,
          grid: parseInt(result.grid)
        };
      });
      totalDrivers = Object.keys(allDrivers).length;
      return allDrivers;
    });
}

function fetchLapData(season, round) {
  const url = `https://ergast.com/api/f1/${season}/${round}/laps.json?limit=1000`;
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      const race = data.MRData.RaceTable.Races[0];
      return race.Laps;
    });
}

function fetchPitStopData(season, round) {
  const url = `https://ergast.com/api/f1/${season}/${round}/pitstops.json?limit=1000`;
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      const race = data.MRData.RaceTable.Races[0];
      return (race && race.PitStops) ? race.PitStops : [];
    });
}

// ---------- UI FUNCTIONS FOR RACE SELECTION ----------
const seasons = [2024, 2023, 2022, 2021, 2020, 2019, 2018]; 

function populateSeasonSelect() {
  seasons.forEach(season => {
    const option = document.createElement("option");
    option.value = season;
    option.text = season;
    seasonSelect.appendChild(option);
  });
}

function populateRaceSelect(season) {
  raceSelect.innerHTML = "";
  const url = `https://ergast.com/api/f1/${season}.json?limit=1000`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const races = data.MRData.RaceTable.Races;
      races.forEach(race => {
        const option = document.createElement("option");
        option.value = race.round;
        option.text = race.raceName;
        raceSelect.appendChild(option);
      });
    });
}

// Event listeners for selection changes.
seasonSelect.addEventListener("change", (e) => {
  selectedSeason = e.target.value;
  populateRaceSelect(selectedSeason);
});

raceSelect.addEventListener("change", (e) => {
  selectedRound = e.target.value;
  selectedRaceName = raceSelect.options[raceSelect.selectedIndex].text;
});

startRaceButton.addEventListener("click", () => {
  if (!selectedSeason || !selectedRound) {
    alert("Please select both season and race.");
    return;
  }
  // Update the race title displayed above the canvas.
  raceTitleDiv.innerText = `${selectedRaceName} - ${selectedSeason}`;
  // Reset globals for a new race.
  currentLapIndex = 0;
  allDrivers = {};
  driversPositions = {};
  raceData = [];
  eventLog.innerText = "";
  // Fetch race data and run the race.
  Promise.all([
    fetchRaceResults(selectedSeason, selectedRound),
    fetchLapData(selectedSeason, selectedRound),
    fetchPitStopData(selectedSeason, selectedRound)
  ]).then(([drivers, laps, pitStops]) => {
    raceData = buildRaceData(laps, pitStops);
    initDriversPositions(raceData[0]);
    drawRace();
    runRace();
  }).catch(error => {
    console.error("Error loading race data:", error);
  });
});

// ---------- INITIALIZE SELECTIONS ON PAGE LOAD ----------
populateSeasonSelect();
selectedSeason = seasonSelect.value;
populateRaceSelect(selectedSeason);
selectedRound = raceSelect.value;
selectedRaceName = raceSelect.options[raceSelect.selectedIndex].text;
