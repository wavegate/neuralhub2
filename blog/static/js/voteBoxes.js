const voteboxes = document.getElementById("voteboxes");
voteboxesHTML = voteboxes.innerHTML;

console.log("check");

const votebox1 = document.getElementById("votebox1");
if (votebox1) {
  votebox1.innerHTML = voteboxesHTML;
  voteboxes.remove();

  displayChart = (data, width) => {
    let plotData = [
      {
        x: data["names"],
        y: data["counters"],
        type: "bar",
      },
    ];
    let layout = {
      width: Math.min(width, 500),
      height: Math.min(width * 0.7, 350),
    };
    Plotly.newPlot("myDiv", plotData, layout);
  };

  addVote = async (url) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
    });
    const data = await response.json();
    return data;
  };

  const svoteboxes = document.getElementsByClassName("votebox");
  for (let votebox of svoteboxes) {
    let button = votebox.getElementsByClassName("votebox__button")[0];
    const re = /votebox#(\d+)/;
    const voteboxID = votebox.id.match(re)[1];
    //   let selected = Array.from(radios).find((radio) => radio.checked);
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      let selectedElement = votebox.querySelector(
        `input[name="${voteboxID}"]:checked`
      );
      if (selectedElement) {
        let selected = selectedElement.id;
        const re = /voteoption#(\d+)/;
        let optionID = selected.match(re)[1];
        let data = await addVote(
          `${event.target.getAttribute("data-url")}${optionID}/`
        );
        let width = votebox.offsetWidth;
        displayChart(data, width);
        votebox.getElementsByClassName("voteOptions")[0].remove();
      }
    });
  }
}

// const voteoptions = document.getElementsByClassName("voteoption");
// for (let voteoption of voteoptions) {
//   let button = voteoption.getElementsByClassName("voteoption__button")[0];
//   let counter = voteoption.getElementsByClassName("voteoption__counter")[0];
//   button.addEventListener("click", async (event) => {
//     event.preventDefault();
//     const re = /voteoption#(\d+)/;
//     let optionID = event.target.id.match(re)[1];
//     let data = await addVote(event.target.getAttribute("data-url"));
//     displayChart(data);
//   });
// }
