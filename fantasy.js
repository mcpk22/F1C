document.addEventListener("DOMContentLoaded", () => {
    const driverDropdowns = [document.getElementById("first"), document.getElementById("second"), document.getElementById("third")];
    const aiPredictionsList = document.getElementById("ai-predictions");
    const raceResultsList = document.getElementById("race-results");
    const scoreElement = document.getElementById("score");
    const currentRaceElement = document.getElementById("current-race");

    function fetchDrivers() {
        fetch("https://ergast.com/api/f1/current/driverStandings.json")
            .then(response => response.json())
            .then(data => {
                const drivers = data.MRData.StandingsTable.StandingsLists[0].DriverStandings.map(driver => driver.Driver);
                driverDropdowns.forEach(dropdown => {
                    dropdown.innerHTML = "<option value=''>Select a driver</option>";
                    drivers.forEach(driver => {
                        const option = document.createElement("option");
                        option.value = driver.driverId;
                        option.textContent = `${driver.givenName} ${driver.familyName}`;
                        dropdown.appendChild(option);
                    });
                });
            });
    }

    function fetchCurrentRace() {
        fetch("https://ergast.com/api/f1/current.json")
            .then(response => response.json())
            .then(data => {
                const races = data.MRData.RaceTable.Races;
                const nextRace = races.find(race => new Date(race.date) > new Date());
                if (nextRace) {
                    currentRaceElement.textContent = `Current Race: ${nextRace.raceName} - ${nextRace.date}`;
                } else {
                    currentRaceElement.textContent = "No upcoming race found.";
                }
            });
    }

    function fetchAIPredictions() {
        fetch("https://ergast.com/api/f1/current/last/results.json")
            .then(response => response.json())
            .then(data => {
                const lastRaceResults = data.MRData.RaceTable.Races[0].Results.slice(0, 3);
                aiPredictionsList.innerHTML = lastRaceResults.map(result => `<li>${result.Driver.givenName} ${result.Driver.familyName}</li>`).join("");
            });
    }

    function fetchRaceResults() {
        fetch("https://ergast.com/api/f1/current/last/results.json")
            .then(response => response.json())
            .then(data => {
                const lastRace = data.MRData.RaceTable.Races[0];
                raceResultsList.innerHTML = `<h3>Last Race: ${lastRace.raceName}</h3>` + lastRace.Results.slice(0, 3).map(result => `<li>${result.Driver.givenName} ${result.Driver.familyName}</li>`).join("");
            });
    }

    document.getElementById("prediction-form").addEventListener("submit", (event) => {
        event.preventDefault();
        fetchRaceResults();
    });

    fetchCurrentRace();
    fetchDrivers();
    fetchAIPredictions();
});
