const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

const trials = [];
const results = [];

const options = ["N", "B", "C", "Z", "D", "E"];
const pickRandom = (array) => {
  return Math.floor(Math.random() * array.length);
};

const percentTargets = 0.5;
const stimDisplayTime = 1000;
const ISI = 800;
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

trials.push({
  index: 0,
  shape: options[pickRandom(options)],
  correctResponse: null,
});
trials.push({
  index: 1,
  shape: options[pickRandom(options)],
  correctResponse: null,
});
for (let i = 2; i < numTrials + 2; i++) {
  if (Math.random() < percentTargets) {
    trials.push({
      index: i,
      shape: trials[i - 2].shape,
      correctResponse: "Y",
    });
  } else {
    const newOptions = [...options];
    const index = newOptions.indexOf(trials[i - 2].shape);
    if (index > -1) {
      newOptions.splice(index, 1);
    }
    trials.push({
      index: i,
      shape: newOptions[pickRandom(newOptions)],
      correctResponse: null,
    });
  }
}

console.log(trials);
let accuracy;
let avgRT;

const submitData = async () => {
  let data = { name: "twoback", trials: trials, results: results };
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
      <h2>Welcome to the 2-back task!</h2>
      <p>In this task, you will be presented with a sequence of letters.</p>
      <p>
        Your goal is to click the "YES" button below only when the letter
        presented is the same letter as that presented TWO letters previous.
      </p>
      <p>
        Respond as quickly and accurately as possible. Total experiment time: ~2
        minutes.
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
      if (target.id == trials[index].correctResponse) {
        document.getElementsByClassName("stim")[0].classList.add("green");
      } else {
        document.getElementsByClassName("stim")[0].classList.add("red");
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
        setTarget(<div className="stim">{trials[index].shape}</div>);
      }, ISI);
      return () => clearTimeout(timeoutID);
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
      let accuracySD = 0.1;
      let averageRT = 700;
      let rtSD = 200;
      let accuracyScore = GetZPercent((accuracy - avgAccuracy) / accuracySD);
      let RTscore = GetZPercent((averageRT - avgRT) / rtSD);
      let score = (accuracyScore + RTscore) / 2;
      score = (score * 100).toFixed(0);
      if (score) {
        localStorage.setItem("twoback", score);
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
      <button id="Y" className="button" onClick={handleClick}>
        YES
      </button>
    </React.Fragment>
  );

  React.useEffect(() => {
    if (index > -1 && index < trials.length) {
      setButton(
        <React.Fragment>
          <button id="Y" className="button" onClick={handleClick}>
            YES
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
