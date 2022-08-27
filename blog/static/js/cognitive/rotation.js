const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

const trials = [];
const numTrials = 20;
const results = [];
const stimDisplayTime = 3600;
const stimDelay = 2600;
const ISI = 1200;

for (let i = 0; i < numTrials; i++) {
  trials.push({
    index: i,
    correctResponse: Math.random() < 0.5 ? "L" : "R",
    rotation: Math.floor(Math.random() * 3 + 1) * 90,
  });
}
console.log(trials);

let accuracy;
let avgRT;

const submitData = async () => {
  let data = { name: "rotation", trials: trials, results: results };
  fetch("/add_experiment", {
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
      <h2>Welcome to the Mental rotation task!</h2>
      <p>
        In this task, you will see an image of black dots. You will then see two
        more images displayed underneath. One of these images is the same as the
        first image, but rotated.
      </p>
      <p>
        Your goal is to click the "LEFT" button below if the left image is the
        rotated one, or click the "RIGHT" button if the right image is the
        rotated one.
      </p>
      <p>
        Respond as quickly and accurately as possible. Total experiment time: ~3
        minutes. Please click a button below to start.
      </p>
    </div>
  );
  const [trial, setTrial] = React.useState({
    response: null,
    startTime: null,
    responseTime: null,
    permitResponse: false,
  });
  const [leftOption, setLeftOption] = React.useState();
  const [rightOption, setRightOption] = React.useState();

  const handleClick = ({ target }) => {
    if (index == -1) {
      setIndex((prev) => prev + 1);
    } else if (index <= trials.length && trial.permitResponse) {
      setTrial({
        response: target.id,
        responseTime: new Date() - trial.startTime,
        permitResponse: false,
      });
      if (target.id == "L" && trials[index].correctResponse == "L") {
        document
          .getElementsByClassName("leftCanvasContainer")[0]
          .classList.add("green");
      }
      if (target.id == "L" && trials[index].correctResponse == "R") {
        document
          .getElementsByClassName("leftCanvasContainer")[0]
          .classList.add("red");
      }
      if (target.id == "R" && trials[index].correctResponse == "R") {
        document
          .getElementsByClassName("rightCanvasContainer")[0]
          .classList.add("green");
      }
      if (target.id == "R" && trials[index].correctResponse == "L") {
        document
          .getElementsByClassName("rightCanvasContainer")[0]
          .classList.add("red");
      }
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
      setTarget();
      setTrial({
        response: null,
        setResponseTime: null,
      });
      setLeftOption();
      setRightOption();
      const timeout1 = setTimeout(() => {
        setTarget(
          <div className="canvasContainer">
            <canvas id="canvas"></canvas>
          </div>
        );
      }, ISI);
      let timeout2;
      if (trials[index].correctResponse == "L") {
        timeout2 = setTimeout(() => {
          setLeftOption(
            <div
              className={`leftCanvasContainer canvasContainer rotated${trials[index].rotation}`}
            >
              <canvas id="canvas"></canvas>
            </div>
          );
          setRightOption(
            <div className="rightCanvasContainer canvasContainer">
              <canvas id="canvas"></canvas>
            </div>
          );
        }, stimDelay);
      } else {
        timeout2 = setTimeout(() => {
          setRightOption(
            <div
              className={`rightCanvasContainer canvasContainer rotated${trials[index].rotation}`}
            >
              <canvas id="canvas"></canvas>
            </div>
          );
          setLeftOption(
            <div className="leftCanvasContainer canvasContainer">
              <canvas id="canvas"></canvas>
            </div>
          );
        }, stimDelay);
      }
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    }
    if (index >= trials.length) {
      console.log(results);
      setLeftOption();
      setRightOption();
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

      let avgAccuracy = 0.7;
      let accuracySD = 0.2;
      let averageRT = 1600;
      let rtSD = 600;
      let accuracyScore = GetZPercent((accuracy - avgAccuracy) / accuracySD);
      let RTscore = GetZPercent((averageRT - avgRT) / rtSD);
      let score = (accuracyScore + RTscore) / 2;
      score = (score * 100).toFixed(0);
      if (score) {
        localStorage.setItem("rotation", score);
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
    if (leftOption) {
      setTrial({ permitResponse: true, startTime: new Date() });
      if (trials[index].correctResponse == "L") {
        const leftCanvasContainer = document.getElementsByClassName(
          "leftCanvasContainer"
        )[0];
        const leftCanvas = leftCanvasContainer.querySelector("#canvas");
        const leftCanvasContext = leftCanvas.getContext("2d");
        const canvas = document
          .getElementsByClassName("canvasContainer")[0]
          .querySelector("#canvas");
        leftCanvas.width = leftCanvasContainer.offsetWidth;
        leftCanvas.height = leftCanvasContainer.offsetHeight;
        leftCanvasContext.drawImage(canvas, 0, 0);
      } else {
        const leftCanvasContainer = document.getElementsByClassName(
          "leftCanvasContainer"
        )[0];
        const leftCanvas = leftCanvasContainer.querySelector("#canvas");
        leftCanvas.width = leftCanvasContainer.offsetWidth;
        leftCanvas.height = leftCanvasContainer.offsetHeight;
        const ctx = leftCanvas.getContext("2d");
        for (let i = 0; i < 10; i++) {
          ctx.beginPath();
          ctx.arc(
            Math.random() * leftCanvas.width,
            Math.random() * leftCanvas.height,
            leftCanvas.width / 20,
            0,
            2 * Math.PI,
            false
          );
          ctx.fillStyle = "rgb(0,0,0)";
          ctx.fill();
        }
      }
    }
  }, [leftOption]);

  React.useEffect(() => {
    if (rightOption) {
      setTrial({ permitResponse: true, startTime: new Date() });
      if (trials[index].correctResponse == "R") {
        const rightCanvasContainer = document.getElementsByClassName(
          "rightCanvasContainer"
        )[0];
        const rightCanvas = rightCanvasContainer.querySelector("#canvas");
        const rightCanvasContext = rightCanvas.getContext("2d");
        const canvas = document
          .getElementsByClassName("canvasContainer")[0]
          .querySelector("#canvas");
        rightCanvas.width = rightCanvasContainer.offsetWidth;
        rightCanvas.height = rightCanvasContainer.offsetHeight;
        rightCanvasContext.drawImage(canvas, 0, 0);
      } else {
        const rightCanvasContainer = document.getElementsByClassName(
          "rightCanvasContainer"
        )[0];
        const rightCanvas = rightCanvasContainer.querySelector("#canvas");
        rightCanvas.width = rightCanvasContainer.offsetWidth;
        rightCanvas.height = rightCanvasContainer.offsetHeight;
        const ctx = rightCanvas.getContext("2d");
        for (let i = 0; i < 10; i++) {
          ctx.beginPath();
          ctx.arc(
            Math.random() * rightCanvas.width,
            Math.random() * rightCanvas.height,
            rightCanvas.width / 20,
            0,
            2 * Math.PI,
            false
          );
          ctx.fillStyle = "rgb(0,0,0)";
          ctx.fill();
        }
      }
    }
  }, [rightOption]);

  React.useEffect(() => {
    if (rightOption || leftOption) {
      const timeoutID = setTimeout(() => {
        setIndex((prev) => prev + 1);
      }, stimDisplayTime);
      return () => {
        clearTimeout(timeoutID);
      };
    }
  }, [leftOption, rightOption]);

  React.useEffect(() => {
    let canvasContainer = document.getElementsByClassName("canvasContainer");
    if (canvasContainer.length > 0) {
      canvasContainer = canvasContainer[0];
      const canvas = canvasContainer.querySelector("#canvas");
      if (canvas) {
        const ctx = canvas.getContext("2d");
        canvas.width = canvasContainer.offsetWidth;
        canvas.height = canvasContainer.offsetHeight;
        for (let i = 0; i < 10; i++) {
          ctx.beginPath();
          ctx.arc(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            canvas.width / 20,
            0,
            2 * Math.PI,
            false
          );
          ctx.fillStyle = "rgb(0,0,0)";
          ctx.fill();
        }
      }
    }
  }, [target]);

  const [button, setButton] = React.useState(
    <React.Fragment>
      <button className="button" id="L" onClick={handleClick}>
        LEFT
      </button>
      <button className="button" id="R" onClick={handleClick}>
        RIGHT
      </button>
    </React.Fragment>
  );

  React.useEffect(() => {
    if (index > -1 && index < trials.length) {
      setButton(
        <React.Fragment>
          <button className="button" id="L" onClick={handleClick}>
            LEFT
          </button>
          <button className="button" id="R" onClick={handleClick}>
            RIGHT
          </button>
        </React.Fragment>
      );
    }
  }, [trial]);

  return (
    <React.Fragment>
      <div className="target">{target}</div>
      <div className="options">
        {leftOption}
        {rightOption}
      </div>
      <div className="buttons">{button}</div>
    </React.Fragment>
  );
}

root.render(<Display />);
