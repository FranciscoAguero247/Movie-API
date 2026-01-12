const API_KEY = typeof CONFIG !== 'undefined' ? CONFIG.API_KEY : 'e02d91c8';
const movieContainer = document.querySelector("#movieList");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#myInput");
const skeletonWrapper = document.querySelector("#skeleton-wrapper");
const searchTermElement = document.querySelector("#search-term");

function showSkeletons() {
  movieContainer.innerHTML = ""; 
  skeletonWrapper.classList.remove("hidden");
  
  skeletonWrapper.innerHTML = new Array(6)
    .fill('<div class="skeleton-card"></div>')
    .join("");
}

async function searchMovies(query) {
  const sanitizedQuery = query?.trim();
  if (!sanitizedQuery) {
    console.warn("Search attempted with empty query.");
    return;
  }

  showSkeletons();
  searchTermElement.textContent = `"${sanitizedQuery}"`;

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(sanitizedQuery)}`
    );

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.Response === "False") {
      const errorMsg = data.Error || "No results found matching your search.";
      movieContainer.innerHTML = `<p class="error-msg" style="color: white;">${errorMsg}</p>`;
      searchTermElement.textContent = `"${sanitizedQuery}" (No results)`;
      return;
    }

    if (Array.isArray(data.Search)) {
      movieContainer.innerHTML = data.Search.map(movie => movieHTML(movie)).join("");
    } else {
      throw new Error("Unexpected data format received from API.");
    }

  } catch (error) {
    
    console.error("Critical Search Error:", error);
    movieContainer.innerHTML = `
      <p class="error-msg" style="color: #ff4d4d;">
        Sorry, we're having trouble reaching the movie database. Please try again later.
      </p>`;
  } finally {
   
    skeletonWrapper.classList.add("hidden");
  }
}

function movieHTML(movie) {
  const posterUrl = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image';
  
  return `
    <div class="movie-card">
        <div class="movie-card__img--wrapper" style="aspect-ratio: 2/3; background: #333;">
           <img src="${posterUrl}" alt="${movie.Title}" loading="lazy">
        </div>
        <div class="movie-card__info">
          <h3>${movie.Title}</h3>
          <p class="color__green">${movie.Year}</p>
        </div>
    </div>
  `;
}

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchMovies(searchInput.value);
    searchInput.value = "";
});

function openMenu() {
  document.body.classList += " menu--open"
}

function closeMenu() {
  document.body.classList.remove('menu--open')
}
