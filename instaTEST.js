document.addEventListener("DOMContentLoaded", () => {
  const likeBtns = document.querySelectorAll(".like-btn");
  
  likeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const likesCount = btn.nextElementSibling;
      let likes = parseInt(likesCount.textContent.split(" ")[0]);
      likes++;
      likesCount.textContent = `${likes} likes`;
    });
  });
});
