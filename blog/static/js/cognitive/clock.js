const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

let trials = [];
let totalPosition = 100;
const numTrials = 90;
const results = [];
const ISI = 1000;
const percentageTargets = 0.2;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const practice = urlParams.get("practice");

for (let i = 0; i < 10; i++) {
  trials.push({
    index: i,
    correctResponse: null,
  });
}

for (let i = 10; i < numTrials + 10; i++) {
  trials.push({
    index: i,
    correctResponse: Math.random() < percentageTargets ? "Y" : null,
  });
}

let positionCount = 0;
let ind = 0;
while (positionCount < totalPosition) {
  if (trials[ind].correctResponse == "Y") {
    positionCount += 2;
  } else {
    positionCount += 1;
  }
  ind++;
}

trials = trials.slice(0, ind);
console.log(trials);

let accuracy;
let avgRT;

const submitData = async () => {
  let data = { name: "clock", trials: trials, results: results };
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

function Clock(props) {
  React.useEffect(() => {
    const clockContainer = document.getElementsByClassName("clockContainer")[0];
    const clock = document.getElementById("clock");
    clock.width = clockContainer.offsetWidth;
    clock.height = clockContainer.offsetHeight;
    const radius = clock.width / 2 - 20;
    const ctx = clock.getContext("2d");
    ctx.translate(clock.width / 2, clock.width / 2);
    drawFace(ctx, radius);
    ctx.beginPath();
    ctx.lineWidth = "3px";
    ctx.lineCap = "round";
    ctx.moveTo(0, 0);
    ctx.rotate((props.position * Math.PI) / 50);
    ctx.lineTo(0, -(radius - 20));
    ctx.stroke();

    function drawFace(ctx, radius) {
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "white";
      ctx.fill();

      ctx.strokeStyle = "black";
      ctx.lineWidth = radius * 0.05;
      ctx.stroke();
    }
  });

  return (
    <div className={`clockContainer ${props.color}`}>
      <canvas id="clock"></canvas>
    </div>
  );
}

function Display() {
  const [index, setIndex] = React.useState(-1);
  const [position, setPosition] = React.useState(-1);
  const [color, setColor] = React.useState();
  const [target, setTarget] = React.useState(
    <div className="message">
      <h2>Welcome to the Mackworth clock task!</h2>
      <p>
        In this task, you will see the hand of the clock tick by a small amount
        each second.
      </p>
      <img
        className="exampleGif"
        src="https://compsciblog.s3.us-west-1.amazonaws.com/clock.gif"
      ></img>
      <p>
        Sometimes, the hand of the clock will move twice as far as the other
        ticks. When this happens, click the button below within 1 second.
      </p>
      <p>Respond as quickly and accurately as possible.</p>
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
    } else if (index < trials.length && trial.permitResponse) {
      setTrial({
        response: target.id,
        responseTime: new Date() - trial.startTime,
        permitResponse: false,
      });
      if (target.id == trials[index].correctResponse) {
        setTarget(<Clock position={position} color="green" />);
      } else {
        setTarget(<Clock position={position} color="red" />);
      }
    }
  };

  React.useEffect(() => {
    // if (color) {
    //   const timeoutID = setTimeout(() => {
    //     setColor();
    //   }, 500);
    //   return () => clearTimeout(timeoutID);
    // }
  }, [color]);

  React.useEffect(() => {
    if (index > 0) {
      results.push({
        index: index - 1,
        response: trial.response ? trial.response : null,
        responseTime: trial.response ? trial.responseTime : null,
      });
    }
    if (index > -1 && index < trials.length) {
      if (trials[index].correctResponse == "Y") {
        setPosition((prev) => prev + 2);
      } else {
        setPosition((prev) => prev + 1);
      }
    } else if (index >= trials.length) {
      console.log(results);
      let targetCount = 0;
      let missedCount = 0;
      const correctTrials = [];
      for (let i = 0; i < results.length; i++) {
        if (trials[i].correctResponse == "Y") {
          targetCount++;
          if (results[i].response != "Y") {
            missedCount++;
          }
        }
        if (trials[i].correctResponse == results[i].response) {
          correctTrials.push(results[i]);
        }
      }
      let relevantTrials = 0;
      let totalRT = 0;
      accuracy = correctTrials.length / results.length;
      for (let i = 0; i < correctTrials.length; i++) {
        if (correctTrials[i].responseTime) {
          totalRT += correctTrials[i].responseTime;
          relevantTrials++;
        }
      }
      avgRT = totalRT / relevantTrials;
      //   let missedPercentage = missedCount / targetCount;
      //   const missedAvg = 0.2;
      //   const missedSD = 0.1;

      let avgAccuracy = 0.8;
      let accuracySD = 0.1;
      let averageRT = 600;
      let rtSD = 300;
      let accuracyScore = GetZPercent((accuracy - avgAccuracy) / accuracySD);
      let RTscore = GetZPercent((averageRT - avgRT) / rtSD);
      let score = (accuracyScore + RTscore) / 2;
      score = (score * 100).toFixed(0);
      if (score) {
        localStorage.setItem("clock", score);
      }
      setTarget(
        <div className="message">
          <h2>Congratulations! You have completed the task.</h2>
          <p>
            You hit {targetCount - missedCount} out of {targetCount} targets.
            Your accuracy was {(accuracy * 100).toFixed(0)}% and your average
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
      if (!practice) {
        submitData();
      }
    }
  }, [index]);

  React.useEffect(() => {
    if (position > -1) {
      setTarget(<Clock position={position} />);
      setTrial({
        response: null,
        permitResponse: true,
        responseTime: null,
        startTime: new Date(),
      });
      const timeoutID = setTimeout(() => {
        setIndex((prev) => prev + 1);
      }, ISI);
      return () => clearTimeout(timeoutID);
    }
  }, [position]);

  React.useEffect(() => {
    if (index > -1) {
      setButton(
        <button id="Y" className="button" onClick={handleClick}>
          <i className="fa-solid fa-hand-pointer"></i>
        </button>
      );
    }
  }, [trial]);

  const [button, setButton] = React.useState(
    <button id="Y" className="button" onClick={handleClick}>
      START
    </button>
  );

  return (
    <React.Fragment>
      <div className={color}>{target}</div>
      <div className="buttons">{button}</div>
    </React.Fragment>
  );
}

root.render(<Display />);
