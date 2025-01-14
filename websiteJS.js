document.addEventListener("DOMContentLoaded", function() {

    function HeaderChange(){
        const Header = document.getElementById("OGheader");
        const hamburger = document.querySelector(".menu-wrap");
        
        if (window.innerWidth <= 768){
            Header.style.display = "none";
            Header.style.opacity = "0";
        }
        else{
            Header.style.display = "block";
        }
    }

    HeaderChange();
})

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) =>{
        console.log(entry);
        if (entry.isIntersecting){
            entry.target.classList.add('show');
        }else{
            entry.target.classList.remove('show');
        }
    });
});


const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer.observe(el));