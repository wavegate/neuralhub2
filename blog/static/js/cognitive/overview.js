const ctx = document.getElementById("myChart");

let twoback = 0;
let gonogo = 0;
let stroop = 0;
let subitizing = 0;
let visual_search = 0;
let posner = 0;
let rotation = 0;
if (localStorage.getItem("twoback")) {
  twoback = localStorage.getItem("twoback");
}
if (localStorage.getItem("gonogo")) {
  gonogo = localStorage.getItem("gonogo");
}
if (localStorage.getItem("stroop")) {
  stroop = localStorage.getItem("stroop");
}
if (localStorage.getItem("subitizing")) {
  subitizing = localStorage.getItem("subitizing");
}
if (localStorage.getItem("visual_search")) {
  visual_search = localStorage.getItem("visual_search");
}
if (localStorage.getItem("posner")) {
  posner = localStorage.getItem("posner");
}
if (localStorage.getItem("rotation")) {
  rotation = localStorage.getItem("rotation");
}

const myChart = new Chart(ctx, {
  type: "radar",
  data: {
    labels: [
      "Working memory",
      "Inhibitory control",
      "Interference control",
      "Cognitive flexibility",
      "Attention",
      "Visual search",
      "Enumeration",
      "Spatial reasoning",
      "Vigilance",
    ],
    datasets: [
      {
        // label: "My First Dataset",
        data: [
          twoback,
          gonogo,
          stroop,
          56,
          posner,
          visual_search,
          subitizing,
          rotation,
          62,
        ],
        fill: true,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgb(255, 99, 132)",
        pointBackgroundColor: "rgb(255, 99, 132)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(255, 99, 132)",
      },
    ],
  },
  options: {
    plugins: {
      legend: {
        display: false,
      },
    },
    elements: {
      line: {
        borderWidth: 3,
      },
    },
  },
});
