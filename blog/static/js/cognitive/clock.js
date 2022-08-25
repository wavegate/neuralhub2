const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

const trials = [];
const numTrials = 20;
const results = [];
const ISI = 1200;
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

function Clock(props) {
  React.useEffect(() => {
    console.log("load");
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
    ctx.rotate(props.position * 0.1);
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
      <h1>Welcome to the Mackworth clock task!</h1>
      <p>
        In this task, you will see the hand of the clock tick by a small amount
        each second.
      </p>
      <p>
        Your goal is to click the "YES" button below if the clock ticks a lot
        more than the other ticks.
      </p>
      <p>Respond as quickly and accurately as possible.</p>
      <p>Please click a button below to begin.</p>
    </div>
  );
  const [response, setResponse] = React.useState();
  const [startTime, setStartTime] = React.useState();
  const [responseTime, setResponseTime] = React.useState();
  const [permitResponse, setPermitResponse] = React.useState();

  React.useEffect(() => {
    if (index > 0) {
      results.push({
        index: index - 1,
        response: response,
        responseTime: responseTime,
      });
    }
    if (index > -1 && index < trials.length) {
      setPermitResponse(true);
      setStartTime(new Date());
      setResponse();
      if (trials[index].correctResponse == "Y") {
        setPosition((prev) => prev + 2);
      } else {
        setPosition((prev) => prev + 1);
      }
      setTarget(<Clock position={position} />);
    } else if (index >= trials.length) {
      const correctTrials = [];
      for (let i = 0; i < results.length; i++) {
        if (trials[i].correctResponse == results[i].response) {
          correctTrials.push(results[i]);
        }
      }
      accuracy = correctTrials.length / results.length;
      let RTsum = 0;
      let relevantTrials = 0;
      for (let i = 0; i < correctTrials.length; i++) {
        const resp = correctTrials[i].responseTime;
        if (resp) {
          RTsum += resp;
          relevantTrials++;
        }
      }
      avgRT = RTsum / relevantTrials;
      console.log(results);
      setTarget(
        <div className="message">
          <h1>Congratulations! You have completed the task.</h1>
          <p>
            Your accuracy was {accuracy} and your average reaction time was{" "}
            {avgRT}.
          </p>
          <p>Feel free to close this window.</p>
        </div>
      );
    }
  }, [index]);

  React.useEffect(() => {
    if (position > -1) {
      const timeoutID = setTimeout(() => {
        setIndex((prev) => prev + 1);
      }, ISI);
      return () => clearTimeout(timeoutID);
    }
  }, [position]);

  const handleClick = ({ target }) => {
    if (index == -1) {
      setIndex((prev) => prev + 1);
    } else if (index < trials.length && permitResponse) {
      setResponse(target.id);
      setResponseTime(new Date() - startTime);
      setPermitResponse(false);
    }
  };

  return (
    <React.Fragment>
      <div className="target">{target}</div>
      <button id="Y" className="button" onClick={handleClick}>
        YES
      </button>
    </React.Fragment>
  );
}

root.render(<Display />);
