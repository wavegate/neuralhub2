const closeButton = document.getElementById("closeButton");
const burgerButton = document.getElementById("burgerButton");
const mobileNav = document.getElementsByClassName("mobileNav")[0];
const overlay = document.getElementsByClassName("overlay")[0];

closeButton.addEventListener("click", () => {
  mobileNav.classList.remove("show");
  overlay.classList.remove("show");
});

burgerButton.addEventListener("click", () => {
  mobileNav.classList.add("show");
  overlay.classList.add("show");
});

// const contactForm = document.getElementById("contactForm");
// contactForm.addEventListener("submit", (event) => {
//   event.preventDefault();
// });

const mobileNavList = document.getElementsByClassName("nav__list--mobile")[0];
navListItems = mobileNavList.getElementsByClassName("nav__listItem");
for (let item of navListItems) {
  item.addEventListener("click", () => {
    mobileNav.classList.remove("show");
    overlay.classList.remove("show");
  });
}

const alerts = document.getElementsByClassName("alert");
for (let alert of alerts) {
  const closeAlertButton = alert.querySelector(".closeAlert");
  closeAlertButton.addEventListener("click", () => {
    alert.remove();
  });
}
