const ctx = document.getElementById("myChart");

let twoback = 0;
let gonogo = 0;
let stroop = 0;
let task_switching = 0;
let subitizing = 0;
let visual_search = 0;
let rotation = 0;
let clock = 0;
if (localStorage.getItem("twoback")) {
  twoback = localStorage.getItem("twoback");
}
if (localStorage.getItem("gonogo")) {
  gonogo = localStorage.getItem("gonogo");
}
if (localStorage.getItem("stroop")) {
  stroop = localStorage.getItem("stroop");
}
if (localStorage.getItem("task_switching")) {
  task_switching = localStorage.getItem("task_switching");
}
if (localStorage.getItem("subitizing")) {
  subitizing = localStorage.getItem("subitizing");
}
if (localStorage.getItem("visual_search")) {
  visual_search = localStorage.getItem("visual_search");
}
if (localStorage.getItem("rotation")) {
  rotation = localStorage.getItem("rotation");
}
if (localStorage.getItem("clock")) {
  clock = localStorage.getItem("clock");
}

const myChart = new Chart(ctx, {
  type: "radar",
  data: {
    labels: [
      "Working memory",
      "Inhibitory control",
      "Interference control",
      "Cognitive flexibility",
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
          task_switching,
          visual_search,
          subitizing,
          rotation,
          clock,
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
