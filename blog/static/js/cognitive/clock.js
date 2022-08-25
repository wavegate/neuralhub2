const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

const trials = [];
const numTrials = 60;
const results = [];
const ISI = 1000;
const percentageTargets = 0.2;

for (let i = 0; i < numTrials; i++) {
  trials.push({
    index: i,
    correctResponse: Math.random() < percentageTargets ? "Y" : null,
  });
}
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
    <div className="clockContainer">
      <canvas id="clock"></canvas>
    </div>
  );
}

function Display() {
  const [index, setIndex] = React.useState(-1);
  const [position, setPosition] = React.useState(-1);
  const [target, setTarget] = React.useState(
    <div className="message">
      <h2>Welcome to the Mackworth clock task!</h2>
      <p>
        In this task, you will see the hand of the clock tick by a small amount
        each second.
      </p>
      <p>
        Your goal is to click the button each time the clock ticks more than the
        other ticks.
      </p>
      <p>Respond as accurately as possible.</p>
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
      if (trials[index].correctResponse == "Y") {
        setPosition((prev) => prev + 2);
      } else {
        setPosition((prev) => prev + 1);
      }
    } else if (index >= trials.length) {
      console.log(results);
      let targetCount = 0;
      let missedCount = 0;
      for (let i = 0; i < results.length; i++) {
        if (trials[i].correctResponse == "Y") {
          targetCount++;
          if (results[i].response != "Y") {
            missedCount++;
          }
        }
      }
      let missedPercentage = missedCount / targetCount;
      const missedAvg = 0.2;
      const missedSD = 0.1;
      const score = (
        GetZPercent((missedAvg - missedPercentage) / missedSD) * 100
      ).toFixed(2);
      setTarget(
        <div className="message">
          <h2>Congratulations! You have completed the task.</h2>
          <p>
            You caught {targetCount - missedCount} out of {targetCount} targets.
            That puts you in the {score}th percentile!
          </p>
          <p>Feel free to close this window.</p>
        </div>
      );
      setButton();
      submitData();
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
      {target}
      <div className="buttons">{button}</div>
    </React.Fragment>
  );
}

root.render(<Display />);
