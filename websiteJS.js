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
    
    const races = [
        { name: "Bahrain Grand Prix", date: "2025-03-02T14:00:00Z" },
        { name: "Saudi Arabian Grand Prix", date: "2025-03-16T18:00:00Z" },
        { name: "Australian Grand Prix", date: "2025-03-30T06:00:00Z" },
        { name: "Azerbaijan Grand Prix", date: "2025-04-13T12:00:00Z" },
        { name: "Miami Grand Prix", date: "2025-05-04T19:30:00Z" },
    ];

    const countdownElement = document.getElementById("countdown");
    const racesListElement = document.getElementById("races-list");

    // Populate races list
    races.forEach((race) => {
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
    

});

