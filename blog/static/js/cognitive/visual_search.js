const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

const trials = [];
const numTrials = 30;
const results = [];

for (let i = 0; i < numTrials; i++) {
  const dice = Math.floor(Math.random() * 10);
  const dice2 = Math.floor(Math.random() * 10);
  trials.push({
    index: i,
    position: [dice, dice2],
  });
}
console.log(trials);

// const stimDisplayTime = 9000000;
const ISI = 1000;

function GetZPercent(z) {
  //z == number of standard deviations from the mean

  //if z is greater than 6.5 standard deviations from the mean
  //the number of significant digits will be outside of a reasonable
  //range
  if (z < -6.5) return 0.0;
  if (z > 6.5) return 1.0;

  var factK = 1;
  var sum = 0;
  var term = 1;
  var k = 0;
  var loopStop = Math.exp(-23);
  while (Math.abs(term) > loopStop) {
    term =
      (((0.3989422804 * Math.pow(-1, k) * Math.pow(z, k)) /
        (2 * k + 1) /
        Math.pow(2, k)) *
        Math.pow(z, k + 1)) /
      factK;
    sum += term;
    k++;
    factK *= k;
  }
  sum += 0.5;

  return sum;
}

const colorChoices = [
  [255, 0, 0],
  [255, 128, 0],
  [255, 255, 0],
  [0, 255, 0],
  [0, 255, 255],
  [0, 0, 255],
  [255, 0, 255],
];

let accuracy;
let avgRT;

const submitData = async () => {
  let data = { name: "visual_search", trials: trials, results: results };
  fetch("/add_experiment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify(data),
  });
};

function getRndColor() {
  var r = (200 * Math.random() + 55) | 0,
    g = (200 * Math.random() + 55) | 0,
    b = (200 * Math.random() + 55) | 0;
  return "rgb(" + r + "," + g + "," + b + ")";
  const pick = Math.floor(Math.random() * 7);
  const pickColor = colorChoices[pick];
  return "rgb(" + pickColor[0] + "," + pickColor[1] + "," + pickColor[2] + ")";
}

function Display() {
  const [index, setIndex] = React.useState(-1);
  const [target, setTarget] = React.useState(
    <div className="message">
      <h2>Welcome to the Visual search task!</h2>
      <p>In this task, you will see an array of dots of different colors.</p>
      <p>Your goal is to click the BLACK dot.</p>
      <p>
        Respond as quickly and accurately as possible. Total experiment time: ~1
        minute.
      </p>
    </div>
  );
  const [trial, setTrial] = React.useState({
    response: null,
    startTime: null,
    responseTime: null,
    permitResponse: false,
  });

  const handleClick = ({ target }) => {
    if (index == -1) {
      setIndex((prev) => prev + 1);
    } else if (index <= trials.length && trial.permitResponse) {
      setTrial({
        response: target.id,
        responseTime: new Date() - trial.startTime,
        permitResponse: false,
      });
      setIndex((prev) => prev + 1);
    }
  };

  React.useEffect(() => {
    if (index > 0) {
      results.push({
        index: index - 1,
        response: trial.response ? trial.response : null,
        responseTime: trial.response ? trial.responseTime : null,
      });
    }
    if (index > -1 && index < trials.length) {
      setButton();
      setTarget();
      const timeoutID = setTimeout(() => {
        setTrial({
          response: null,
          setResponseTime: null,
          permitResponse: true,
          startTime: new Date(),
        });
      }, ISI);
      return () => clearInterval(timeoutID);
    }
    if (index >= trials.length) {
      console.log(results);
      let relevantTrials = 0;
      let totalRT = 0;
      for (let i = 0; i < results.length; i++) {
        if (results[i].responseTime) {
          totalRT += results[i].responseTime;
          relevantTrials++;
        }
      }
      avgRT = totalRT / relevantTrials;
      let averageRT = 1500;
      let rtSD = 600;
      let RTscore = GetZPercent((averageRT - avgRT) / rtSD);
      let score = RTscore;
      score = (score * 100).toFixed(0);
      if (score) {
        localStorage.setItem("visual_search", score);
        submitData();
      }
      setTarget(
        <div className="message">
          <h2>Congratulations! You have completed the task.</h2>
          <p>
            Your average reaction time was {avgRT.toFixed(0)} milliseconds. This
            gives you a score of <strong>{score}</strong>!
          </p>
          <p>Feel free to close this window.</p>
        </div>
      );
      setButton(
        <a className="button" href={bloglink}>
          <i className="fa-solid fa-xmark"></i>
        </a>
      );
    }
  }, [index]);

  React.useEffect(() => {
    if (index > -1 && index < trials.length && trial.permitResponse) {
      setTarget(
        <div className="canvasContainer">
          <button id="invisButton" onClick={handleClick}></button>
          <canvas id="canvas"></canvas>
        </div>
      );
    }
  }, [trial]);

  React.useEffect(() => {
    if (index > -1 && index < trials.length && target) {
      const canvas = document.getElementById("canvas");
      const canvasContainer =
        document.getElementsByClassName("canvasContainer")[0];

      if (canvas) {
        canvas.width = canvasContainer.offsetWidth;
        canvas.height = canvasContainer.offsetWidth;
        const ctx = canvas.getContext("2d");

        function drawCircle(x, y, color) {
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.fill();
        }
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            if (
              i == trials[index].position[0] &&
              j == trials[index].position[1]
            ) {
              const invisButton = document.getElementById("invisButton");
              invisButton.style.left = `${
                (i / 10) * (canvas.width - canvas.width / 10) +
                canvas.width / 10
              }px`;
              invisButton.style.top = `${
                (j / 10) * (canvas.height - canvas.height / 10) +
                canvas.height / 10
              }px`;
              invisButton.style.height = `${canvas.height / 10}px`;
              invisButton.style.width = `${canvas.width / 10}px`;
              drawCircle(
                (i / 10) * (canvas.width - canvas.width / 10) +
                  canvas.width / 10,
                (j / 10) * (canvas.height - canvas.height / 10) +
                  canvas.height / 10,
                "rgb(0,0,0)"
              );
            } else {
              drawCircle(
                (i / 10) * (canvas.width - canvas.width / 10) +
                  canvas.width / 10,
                (j / 10) * (canvas.height - canvas.height / 10) +
                  canvas.height / 10,
                getRndColor()
              );
            }
          }
        }
      }
    }
  }, [target]);

  const [button, setButton] = React.useState(
    <button id="Y" className="button" onClick={handleClick}>
      START
    </button>
  );

  return (
    <React.Fragment>
      <div className="target">{target}</div>
      <div className="buttons">{button}</div>
    </React.Fragment>
  );
}

root.render(<Display />);
