const closeButton = document.getElementById("closeButton");
const burgerButton = document.getElementById("burgerButton");
const mobileNav = document.getElementsByClassName("mobileNav")[0];
const overlay = document.getElementsByClassName("overlay")[0];
const loadMoreButton = document.getElementById("loadMoreButton");
const secondaryNews = document.getElementsByClassName("secondaryNews");

closeButton.addEventListener("click", () => {
  mobileNav.classList.remove("show");
  overlay.classList.remove("show");
});

burgerButton.addEventListener("click", () => {
  mobileNav.classList.add("show");
  overlay.classList.add("show");
});

loadMoreButton.addEventListener("click", () => {
  for (let news of secondaryNews) {
    news.classList.remove("hidden");
  }
  loadMoreButton.classList.add("hidden");
});
