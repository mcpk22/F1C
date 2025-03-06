document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.getElementById('carousel');
  let articles = [];
  let currentIndex = 0;

  // Fetch news from the backend API
  fetch('/api/news')
    .then(response => response.json())
    .then(data => {
      articles = data;
      if (articles.length > 0) {
        renderArticle(currentIndex);
        startAutoSlide();
      }
    })
    .catch(err => console.error("Error fetching news:", err));

  function renderArticle(index) {
    const article = articles[index];
    carousel.innerHTML = `
      <div class="article">
        <img src="${article.urlToImage || 'default.jpg'}" alt="News Image">
        <h2>${article.title}</h2>
        <p>${article.description || ''}</p>
        <a href="${article.url}" target="_blank">Read more</a>
      </div>
    `;
  }

  document.getElementById('prev').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + articles.length) % articles.length;
    renderArticle(currentIndex);
  });

  document.getElementById('next').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % articles.length;
    renderArticle(currentIndex);
  });

  // Auto slide every 5 seconds
  function startAutoSlide() {
    setInterval(() => {
      currentIndex = (currentIndex + 1) % articles.length;
      renderArticle(currentIndex);
    }, 5000);
  }
});
