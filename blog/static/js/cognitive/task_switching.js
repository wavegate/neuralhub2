const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

const trials = [];
const results = [];
const numTrials = 40;
const ISI = 1600;
const stimDuration = 2600;

for (let i = 0; i < numTrials; i++) {
  const task = Math.random() < 0.5 ? "color" : "shape";
  const color = Math.random() < 0.5 ? "blue" : "orange";
  const shape = Math.random() < 0.5 ? "circle" : "square";
  trials.push({
    index: i,
    color: color,
    shape: shape,
    task: task,
    // left for blue and left for circle, right for orange and right for circle
    correctResponse:
      (task == "color" && color == "blue") ||
      (task == "shape" && shape == "circle")
        ? "L"
        : "R",
  });
}
console.log(trials);

let accuracy;
let avgRT;

const submitData = async () => {
  let data = { name: "task_switching", trials: trials, results: results };
  fetch("/add_experiment/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify(data),
  });
};

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

function Display() {
  const [index, setIndex] = React.useState(-1);
  const [target, setTarget] = React.useState(
    <div className="message">
      <h1>Welcome to the Task switching assessment!</h1>
      <p>
        In this task, you will be presented with either a circle or a square
        with a color either orange or blue, and will be asked to task-switch
        between shape and color. Total experiment time: ~3 minutes.
      </p>
      <p>
        If the target appears in the SHAPE box, click LEFT for CIRCLE and RIGHT
        for SQUARE.
      </p>
      <p>
        If the target appears in the COLOR box, click LEFT for BLUE and RIGHT
        for ORANGE.
      </p>
      <img
        className="exampleGif"
        src="https://compsciblog.s3.us-west-1.amazonaws.com/task_switch.png"
      ></img>
    </div>
  );
  const [trial, setTrial] = React.useState({
    response: null,
    startTime: null,
    responseTime: null,
    permitResponse: false,
  });

  React.useEffect(() => {
    console.log(index);
    if (index > 0) {
      results.push({
        index: index - 1,
        response: trial.response ? trial.response : null,
        responseTime: trial.response ? trial.responseTime : null,
      });
    }
    if (index > -1 && index < trials.length) {
      setTarget();
      setTarget(
        <div className="stimTask">
          <div className="topStim">SHAPE</div>
          <div className="stimContainer"></div>
          <div className="stimContainer"></div>
          <div className="bottomStim">COLOR</div>
        </div>
      );
      const timeoutID = setTimeout(() => {
        if (trials[index].task == "shape") {
          setTarget(
            <div className="stimTask">
              <div className="topStim">SHAPE</div>
              <div className="stimContainer">
                <div className="canvasBox">
                  <canvas id="canvas"></canvas>
                </div>
              </div>
              <div className="stimContainer"></div>
              <div className="bottomStim">COLOR</div>
            </div>
          );
        } else {
          setTarget(
            <div className="stimTask">
              <div className="topStim">SHAPE</div>
              <div className="stimContainer"></div>
              <div className="stimContainer">
                <div className="canvasBox">
                  <canvas id="canvas"></canvas>
                </div>
              </div>
              <div className="bottomStim">COLOR</div>
            </div>
          );
        }
      }, ISI);
      return () => clearInterval(timeoutID);
    }
    if (index >= trials.length) {
      console.log(results);
      const correctTrials = [];
      for (let i = 0; i < results.length; i++) {
        if (trials[i].correctResponse == results[i].response) {
          correctTrials.push(results[i]);
        }
      }
      accuracy = correctTrials.length / results.length;
      let relevantTrials = 0;
      let totalRT = 0;
      for (let i = 0; i < correctTrials.length; i++) {
        if (correctTrials[i].responseTime) {
          totalRT += correctTrials[i].responseTime;
          relevantTrials++;
        }
      }
      avgRT = totalRT / relevantTrials;

      let avgAccuracy = 0.8;
      let accuracySD = 0.2;
      let averageRT = 1200;
      let rtSD = 400;
      let accuracyScore = GetZPercent((accuracy - avgAccuracy) / accuracySD);
      let RTscore = GetZPercent((averageRT - avgRT) / rtSD);
      let score = (accuracyScore + RTscore) / 2;
      score = (score * 100).toFixed(0);
      if (score) {
        localStorage.setItem("task_switching", score);
        submitData();
      }
      setTarget(
        <div className="message">
          <h2>Congratulations! You have completed the task.</h2>
          <p>
            You hit {correctTrials.length} out of {trials.length} targets. Your
            accuracy was {(accuracy * 100).toFixed(0)}% and your average
            reaction time was {avgRT.toFixed(0)} milliseconds. This gives you a
            score of <strong>{score}</strong>!
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
    if (index > -1 && index < trials.length && target) {
      const canvasBox = document.getElementsByClassName("canvasBox")[0];
      if (canvasBox) {
        const canvas = canvasBox.querySelector("#canvas");
        if (canvas) {
          canvas.width = canvasBox.offsetWidth;
          canvas.height = canvasBox.offsetHeight;
          const ctx = canvas.getContext("2d");

          if (trials[index].shape == "circle") {
            //drawCircle
            ctx.beginPath();
            ctx.arc(
              canvas.width / 2,
              canvas.height / 2,
              canvas.width / 2,
              2 * Math.PI,
              false
            );
          } else {
            ctx.rect(0, 0, canvas.width, canvas.height);
          }

          if (trials[index].color == "blue") {
            ctx.fillStyle = "blue";
          } else {
            ctx.fillStyle = "orange";
          }
          ctx.fill();
        }
        setTrial({
          response: null,
          setResponseTime: null,
          permitResponse: true,
          startTime: new Date(),
        });
        const timeoutID = setTimeout(() => {
          setIndex((prev) => prev + 1);
        }, stimDuration);
        return () => clearTimeout(timeoutID);
      }
    }
  }, [target]);

  const handleClick = ({ target }) => {
    if (index == -1) {
      setIndex((prev) => prev + 1);
    } else if (index <= trials.length && trial.permitResponse) {
      setTrial({
        response: target.id,
        responseTime: new Date() - trial.startTime,
        permitResponse: false,
      });
      if (target.id == trials[index].correctResponse) {
        document.getElementsByClassName("canvasBox")[0].classList.add("green");
      } else {
        document.getElementsByClassName("canvasBox")[0].classList.add("red");
      }
    }
  };

  const [button, setButton] = React.useState(
    <React.Fragment>
      <button id="L" className="button" onClick={handleClick}>
        LEFT
      </button>
      <button id="R" className="button" onClick={handleClick}>
        RIGHT
      </button>
    </React.Fragment>
  );

  React.useEffect(() => {
    if (index > -1 && index < trials.length) {
      setButton(
        <React.Fragment>
          <button id="L" className="button" onClick={handleClick}>
            LEFT
          </button>
          <button id="R" className="button" onClick={handleClick}>
            RIGHT
          </button>
        </React.Fragment>
      );
    }
  }, [trial]);

  return (
    <React.Fragment>
      {target}
      <div className="buttons">{button}</div>
    </React.Fragment>
  );
}

root.render(<Display />);
