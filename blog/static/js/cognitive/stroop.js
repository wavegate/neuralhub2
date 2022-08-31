const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

const trials = [];
const results = [];

const stimDisplayTime = 800;
const ISI = 600;

const numTrials = 60;

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

for (let i = 0; i < numTrials; i++) {
  const dice = Math.random();
  if (dice < 0.25) {
    trials.push({
      index: i,
      shape: "RED",
      correctResponse: "R",
      color: "redCol",
      congruent: true,
    });
  } else if (dice >= 0.25 && dice < 0.5) {
    trials.push({
      index: i,
      shape: "RED",
      correctResponse: "G",
      color: "greenCol",
      congruent: false,
    });
  } else if (dice >= 0.5 && dice < 0.75) {
    trials.push({
      index: i,
      shape: "GREEN",
      correctResponse: "R",
      color: "redCol",
      congruent: false,
    });
  } else {
    trials.push({
      index: i,
      shape: "GREEN",
      correctResponse: "G",
      color: "greenCol",
      congruent: true,
    });
  }
}
console.log(trials);

let accuracy;
let avgRT;
let congruentRT;
let incongruentRT;

const submitData = async () => {
  let data = { name: "stroop", trials: trials, results: results };
  fetch("/add_experiment/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify(data),
  });
};

function Display() {
  const [index, setIndex] = React.useState(-1);
  const [target, setTarget] = React.useState(
    <div className="message">
      <h2>Welcome to the Stroop task!</h2>
      <p>
        In this task, you will be presented with a word in either the color
        green or red.
      </p>
      <p>
        Click the GREEN button below whenever you see a word in the COLOR green
        (ignore the text!). Click the RED button when you see a word in the
        COLOR red.
      </p>
      <p>
        Respond as quickly and accurately as possible. Total experiment time: ~2
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
          <div className="stim">
            <span className={trials[index].color}>{trials[index].shape}</span>
          </div>
        );
      }, ISI);
      return () => clearTimeout(timeoutID);
    }
    if (index >= trials.length) {
      console.log(results);
      const correctTrials = [];
      let congruentRTTotal = 0;
      let congruentRTCount = 0;
      let incongruentRTTotal = 0;
      let incongruentRTCount = 0;
      for (let i = 0; i < results.length; i++) {
        if (trials[i].correctResponse == results[i].response) {
          correctTrials.push(results[i]);
          if (trials[i].congruent && results[i].responseTime) {
            congruentRTTotal += results[i].responseTime;
            congruentRTCount++;
          }
          if (!trials[i].congruent && results[i].response) {
            incongruentRTTotal += results[i].responseTime;
            incongruentRTCount++;
          }
        }
      }
      congruentRT = congruentRTTotal / congruentRTCount;
      incongruentRT = incongruentRTTotal / incongruentRTCount;
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
      let accuracySD = 0.1;
      let averageRT = 600;
      let rtSD = 100;
      let accuracyScore = GetZPercent((accuracy - avgAccuracy) / accuracySD);
      let RTscore = GetZPercent((averageRT - avgRT) / rtSD);
      let score = (accuracyScore + RTscore) / 2;
      score = (score * 100).toFixed(0);
      if (score) {
        localStorage.setItem("stroop", score);
        submitData();
      }
      setTarget(
        <div className="messageTop">
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
      setChart(
        <div className="chartContainer">
          <canvas id="myChart"></canvas>
        </div>
      );
    }
  }, [index]);

  React.useEffect(() => {
    if (target && index > -1 && index < trials.length) {
      setTrial({
        response: null,
        setResponseTime: null,
        permitResponse: true,
        startTime: new Date(),
      });
      const timeoutID = setTimeout(() => {
        setIndex((prev) => prev + 1);
      }, stimDisplayTime);
      return () => clearTimeout(timeoutID);
    }
  }, [target]);

  const [button, setButton] = React.useState(
    <React.Fragment>
      <button id="G" className="button" onClick={handleClick}>
        GREEN
      </button>
      <button id="R" className="button" onClick={handleClick}>
        RED
      </button>
    </React.Fragment>
  );

  React.useEffect(() => {
    if (chart) {
      const cht = document.getElementById("myChart");

      const myChart = new Chart(cht, {
        type: "bar",
        data: {
          labels: ["Congruent", "Incongruent"],
          datasets: [
            {
              label: "Reaction time",
              data: [congruentRT, incongruentRT],
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(255, 159, 64, 0.2)",
              ],
              borderColor: ["rgb(255, 99, 132)", "rgb(255, 159, 64)"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [chart]);

  React.useEffect(() => {
    if (index > -1 && index < trials.length) {
      setButton(
        <React.Fragment>
          <button id="G" className="button" onClick={handleClick}>
            GREEN
          </button>
          <button id="R" className="button" onClick={handleClick}>
            RED
          </button>
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
