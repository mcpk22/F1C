document.addEventListener("DOMContentLoaded", () => {
    const posts = document.querySelectorAll(".post");

    posts.forEach((post)=>{
        const paragraph = post.querySelector(".post-text");
        const readMoreBtn = post.querySelector(".read-more");

        //get word count
        const word = paragraph.textContent.trim().split(/\s+/);
        const fullText = word.join(" "); // Store the full text
        const lessText = word.slice(0, 30).join(" ") + "...";

        if (word.length > 30){
            paragraph.textContent = lessText;
            readMoreBtn.style.display = "inline-block";

            let isExpanded = false;

            readMoreBtn.addEventListener("click", () =>{
                if (isExpanded){
                    paragraph.textContent = lessText;
                    readMoreBtn.textContent = "Read More";
                }else{
                    paragraph.textContent = fullText;
                    readMoreBtn.textContent = "Read Less";
                }

                isExpanded = !isExpanded; // Toggle state
            })
            
        } else {
            readMoreBtn.style.display = "none";
        }


        
        const likeBtn = post.querySelector(".like-btn");
        const commentBtn = post.querySelector(".comment-btn");
        const shareBtn = post.querySelector(".share-btn");

            likeBtn.addEventListener("click", () => {
                alert("You liked the post!");
            });

            commentBtn.addEventListener("click", () => {
                alert("Comment section opened!");
            });

            shareBtn.addEventListener("click", () => {
                alert("Share this post!");
            });
    })
    
/* Race info box */

    // const races = [
    //     { name: "Bahrain Grand Prix", date: "2025-03-02T14:00:00Z" },
    //     { name: "Saudi Arabian Grand Prix", date: "2025-03-16T18:00:00Z" },
    //     { name: "Australian Grand Prix", date: "2025-03-30T06:00:00Z" },
    //     { name: "Azerbaijan Grand Prix", date: "2025-04-13T12:00:00Z" },
    //     { name: "Miami Grand Prix", date: "2025-05-04T19:30:00Z" },
    // ];

    const countdownElement = document.getElementById("countdown");
    const racesListElement = document.getElementById("races-list");

    fetch("https://ergast.com/api/f1/current.json")
    .then(response => response.json())
    .then(data => {
        const races = data.MRData.RaceTable.Races.map(race => ({
            name: race.raceName,
            date: race.date + "T" + race.time // Combining date & time
        }));

        // Sort races by date to get the upcoming ones
        const upcomingRaces = races.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Only keep the top 5 upcoming races
        const next5Races = upcomingRaces.slice(0, 5);

        // Populate race list
        next5Races.forEach(race => {
            const listItem = document.createElement("li");
            listItem.textContent = `${race.name} - ${new Date(race.date).toLocaleDateString()}`;
            racesListElement.appendChild(listItem);
        });


    // Find the next race
    const now = new Date();
    const nextRace = races.find((race) => new Date(race.date) > now);

    if (nextRace) {
        const targetDate = new Date(nextRace.date);

        function updateCountdown() {
            const currentTime = new Date();
            const timeDifference = targetDate - currentTime;

            if (timeDifference <= 0) {
                countdownElement.textContent = "The next race is happening now!";
                clearInterval(interval);
                return;
            }

            const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
            const seconds = Math.floor((timeDifference / 1000) % 60);

            countdownElement.textContent = `Next race: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
        }

        updateCountdown(); // Initial call
        const interval = setInterval(updateCountdown, 1000); // Update every second
    } else {
        countdownElement.textContent = "No upcoming races this season.";
    }
    })
    .catch(error => console.error("Error fetching data:", error));
    

// DRIVER INFO BOX


    const tableBody = document.getElementById("driver-standings-body");


    fetch("https://ergast.com/api/f1/current/driverStandings.json")
        .then(response => response.json())
        .then(data => {
            const standings = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
            const tableBody = document.getElementById("driver-standings-body");

            //only show top 5 drivers
            const top5Drivers = standings.slice(0,5);

            top5Drivers.forEach(driver => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${driver.position}</td>
                    <td><img src="logos/${driver.Constructors[0].constructorId}.png" alt="${driver.Constructors[0].name}" class="team-logo">${driver.Constructors[0].name}</td>
                    <td>${driver.Driver.givenName} ${driver.Driver.familyName}</td>
                    <td>${driver.points}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Error fetching data:", error));


// TEAM'S INFO BOX

    const teamLogoMap = {
        mercedes: "mercedes-logo.png",
        red_bull: "logos/red-bull-racing-logo-1.png",
        ferrari: "logos/Ferrari-F1-Logo.png",
        mclaren: "logos/mclaren-logo.png",
        aston_martin: "astonmartin-logo.png",
    };

    

    fetch("https://ergast.com/api/f1/current/constructorStandings.json")
    .then(response => response.json())
    .then(data => {
        const standings = data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
        const tableBody = document.getElementById("teams-standings-body");

        // Only show top 5 teams
        const top5Teams = standings.slice(0, 5);

        top5Teams.forEach(team => {

            const logoFileName = teamLogoMap[team.Constructor.constructorId] || "F1/logos/default-logo.png";
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${team.position}</td>
                <td><img src="${logoFileName}" alt="${team.Constructor.name}" class="team-logo"> ${team.Constructor.name}</td>
                <td>${team.points}</td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => console.error("Error fetching data:", error));

});

//${team.Constructor.constructorId}.png