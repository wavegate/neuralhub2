const ctx = document.getElementById("myChart");

let twoback = 90;
console.log(localStorage.getItem("twoback"));
if (localStorage.getItem("twoback")) {
  twoback = localStorage.getItem("twoback");
}

const myChart = new Chart(ctx, {
  type: "radar",
  data: {
    labels: [
      "Working memory",
      "Short-term memory",
      "Inhibitory control",
      "Interference control",
      "Cognitive flexibility",
      "Attention",
      "Search",
      "Enumeration",
      "Semantic memory",
      "Spatial reasoning",
      "Vigilance",
    ],
    datasets: [
      {
        label: "My First Dataset",
        data: [twoback, 59, 90, 81, 56, 55, 40, 76, 45, 62, 98],
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
