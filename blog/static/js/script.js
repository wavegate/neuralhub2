const closeButton = document.getElementById("closeButton");
const burgerButton = document.getElementById("burgerButton");
const mobileNav = document.getElementsByClassName("mobileNav")[0];
const overlay = document.getElementsByClassName("overlay")[0];
const loadMoreButton = document.getElementById("loadMoreButton");
const secondaryNews = document.getElementsByClassName("secondaryNews");
// const closeAlertButton = document.getElementById("closeAlert");
const alerts = document.getElementsByClassName("alert");

closeButton.addEventListener("click", () => {
  mobileNav.classList.remove("show");
  overlay.classList.remove("show");
});

burgerButton.addEventListener("click", () => {
  mobileNav.classList.add("show");
  overlay.classList.add("show");
});

if (loadMoreButton) {
  loadMoreButton.addEventListener("click", () => {
    for (let news of secondaryNews) {
      news.classList.remove("hidden");
    }
    loadMoreButton.classList.add("hidden");
  });
}

for (let alert of alerts) {
  const closeAlertButton = alert.querySelector(".closeAlert");
  closeAlertButton.addEventListener("click", () => {
    alert.remove();
  });
}
