const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

let trials = [];
const numTrials = 70;
for (let i = 0; i < numTrials; i++) {
  const dice = Math.floor(Math.random() * 9 + 1);
  trials.push({
    index: i,
    correctResponse: dice,
  });
}
console.log(trials);

let accuracy;
let avgRT;

const submitData = async () => {
  let data = { name: "subitizing", trials: trials, results: results };
  fetch("/add_experiment/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify(data),
  });
};

let results = [];
const stimDisplayTime = 1400;
const ISI = 1000;
const accuracyByNumber = [];

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
      <h2>Welcome to the Subitizing task!</h2>
      <p>
        In this task, you will be presented with a number of dots for a brief
        moment.
      </p>
      <p>
        Your goal is to click the button corresponding to the number of dots
        that you saw.
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
  const [chart, setChart] = React.useState();

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
        const canvasContainer__subitizing = document.getElementsByClassName(
          "canvasContainer__subitizing"
        );
        if (canvasContainer__subitizing.length > 0) {
          canvasContainer__subitizing[0].classList.add("green");
        }
      } else {
        const canvasContainer__subitizing = document.getElementsByClassName(
          "canvasContainer__subitizing"
        );
        if (canvasContainer__subitizing.length > 0) {
          canvasContainer__subitizing[0].classList.add("red");
        }
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
      const timeoutID = setTimeout(() => {
        setTarget(
          <div className="canvasContainer__subitizing">
            <canvas id="canvas"></canvas>
          </div>
        );
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
      let max = 0;
      let searchMax = true;
      for (let i = 1; i <= 9; i++) {
        let totTrials = 0;
        let numCorrect = 0;
        for (let j = 0; j < trials.length; j++) {
          if (trials[j].correctResponse == i) {
            totTrials++;
            if (results[j].response == i) {
              numCorrect++;
            }
          }
        }
        if (totTrials) {
          accuracyByNumber.push(numCorrect / totTrials);
          if (numCorrect / totTrials > 0.5 && searchMax) {
            max = i;
          } else {
            searchMax = false;
          }
        } else {
          accuracyByNumber.push(null);
        }
      }

      let avgAccuracy = 0.6;
      let accuracySD = 0.2;
      let averageRT = 1000;
      let rtSD = 300;
      let accuracyScore = GetZPercent((accuracy - avgAccuracy) / accuracySD);
      let RTscore = GetZPercent((averageRT - avgRT) / rtSD);
      let score = (accuracyScore + RTscore) / 2;
      score = (score * 100).toFixed(0);
      if (score) {
        localStorage.setItem("subitizing", score);
        submitData();
      }
      setChart();
      setTarget(
        <div className="messageTop">
          <h2>Congratulations! You have completed the task.</h2>
          <p>
            You hit {correctTrials.length} out of {trials.length} targets. Your
            accuracy was {(accuracy * 100).toFixed(0)}% and your average
            reaction time was {avgRT.toFixed(0)} milliseconds. The approximate
            number of objects you can enumerate is {max}. This gives you a score
            of <strong>{score}</strong>!
          </p>
          <p>Feel free to close this window.</p>
        </div>
      );
      setButton(
        <a className="button" href={bloglink}>
          <i className="fa-solid fa-xmark"></i>
        </a>
      );
      setChart(
        <div className="chartContainer">
          <canvas id="myChart"></canvas>
        </div>
      );
    }
  }, [index]);

  React.useEffect(() => {
    if (chart) {
      const cht = document.getElementById("myChart");

      const myChart = new Chart(cht, {
        type: "line",
        data: {
          labels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
          datasets: [
            {
              label: "Accuracy",
              data: accuracyByNumber,
              fill: false,
              borderColor: "rgb(75, 192, 192)",
              tension: 0.1,
            },
          ],
        },
        options: {
          scales: {
            x: {
              type: "linear",
              position: "bottom",
            },
          },
        },
      });
    }
  }, [chart]);

  React.useEffect(() => {
    if (target && index > -1 && index < trials.length) {
      setTrial({ permitResponse: true, startTime: new Date() });
      const canvas = document.getElementById("canvas");
      const canvasContainer__subitizing = document.getElementsByClassName(
        "canvasContainer__subitizing"
      )[0];
      if (canvas) {
        canvas.width = canvasContainer__subitizing.offsetWidth;
        canvas.height = canvasContainer__subitizing.offsetHeight;
        const ctx = canvas.getContext("2d");
        const numDots = trials[index].correctResponse;

        function drawCircle(x, y) {
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
          ctx.fill();
        }
        for (let i = 0; i < numDots; i++) {
          drawCircle(
            Math.floor(Math.random() * (canvas.width - 50)) + 25,
            Math.floor(Math.random() * (canvas.height - 50)) + 25
          );
        }
      }
      const timeoutID = setTimeout(() => {
        setIndex((prev) => prev + 1);
      }, stimDisplayTime);
      return () => clearTimeout(timeoutID);
    }
  }, [target]);

  const [button, setButton] = React.useState(
    <React.Fragment>
      <div className="buttonGrid">
        <button id="1" className="button" onClick={handleClick}>
          1
        </button>
        <button id="2" className="button" onClick={handleClick}>
          2
        </button>
        <button id="3" className="button" onClick={handleClick}>
          3
        </button>
        <button id="4" className="button" onClick={handleClick}>
          4
        </button>
        <button id="5" className="button" onClick={handleClick}>
          5
        </button>
        <button id="6" className="button" onClick={handleClick}>
          6
        </button>
        <button id="7" className="button" onClick={handleClick}>
          7
        </button>
        <button id="8" className="button" onClick={handleClick}>
          8
        </button>
        <button id="9" className="button" onClick={handleClick}>
          9
        </button>
      </div>
    </React.Fragment>
  );

  React.useEffect(() => {
    if (index > -1 && index < trials.length) {
      setButton(
        <React.Fragment>
          <div className="buttonGrid">
            <button id="1" className="button" onClick={handleClick}>
              1
            </button>
            <button id="2" className="button" onClick={handleClick}>
              2
            </button>
            <button id="3" className="button" onClick={handleClick}>
              3
            </button>
            <button id="4" className="button" onClick={handleClick}>
              4
            </button>
            <button id="5" className="button" onClick={handleClick}>
              5
            </button>
            <button id="6" className="button" onClick={handleClick}>
              6
            </button>
            <button id="7" className="button" onClick={handleClick}>
              7
            </button>
            <button id="8" className="button" onClick={handleClick}>
              8
            </button>
            <button id="9" className="button" onClick={handleClick}>
              9
            </button>
          </div>
        </React.Fragment>
      );
    }
  }, [trial]);

  return (
    <React.Fragment>
      {target}
      {chart}
      <div className="buttons">{button}</div>
    </React.Fragment>
  );
}

root.render(<Display />);
