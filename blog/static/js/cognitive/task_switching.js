const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

const trials = [];
const results = [];
const numTrials = 5;
const ISI = 1600;
const maxStimDuration = 2000;

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

let accuracy;
let avgRT;

function Display() {
  const [index, setIndex] = React.useState(-1);
  const [target, setTarget] = React.useState();
  const [startTime, setStartTime] = React.useState();
  const [permitResponse, setPermitResponse] = React.useState();
  const [response, setResponse] = React.useState();
  const [responseTime, setResponseTime] = React.useState();

  React.useEffect(() => {
    setTarget(
      <div className="message">
        <h1>Welcome to the task switching assessment!</h1>
        <p>
          In this task, you will be presented with either a circle or a square,
          and the shape will be colored either orange or blue.
        </p>
        <p>
          The shape will appear in the "SHAPE" box or the "COLOR" box. If it
          appears in the "SHAPE" box, click the "LEFT" button if the SHAPE of
          the stimulus is a circle, and click the "RIGHT" button if the SHAPE of
          the stimulus is a square.
        </p>
        <p>
          If it appears in the "COLOR" box, click the "LEFT" button if the COLOR
          of the stimulus is blue, and click the "RIGHT" button if the COLOR of
          the stimulus is orange.
        </p>
      </div>
    );
  }, []);

  React.useEffect(() => {
    if (index > 0) {
      results.push({
        index: index - 1,
        response: response,
        responseTime: responseTime,
      });
    }
    if (index > -1 && index < trials.length) {
      setResponse("");
      setResponseTime("");
      setTarget(
        <div className="stimTask">
          <div className="topStim">SHAPE</div>
          <div className="stimContainer"></div>
          <div className="stimContainer stimContainer2"></div>
          <div className="bottomStim">COLOR</div>
        </div>
      );
      setTimeout(() => {
        if (trials[index].task == "shape") {
          setTarget(
            <div className="stimTask">
              <div className="topStim">SHAPE</div>
              <div className="stimContainer">
                <div className="canvasBox">
                  <canvas id="canvas"></canvas>
                </div>
              </div>
              <div className="stimContainer stimContainer2"></div>
              <div className="bottomStim">COLOR</div>
            </div>
          );
        } else {
          setTarget(
            <div className="stimTask">
              <div className="topStim">SHAPE</div>
              <div className="stimContainer"></div>
              <div className="stimContainer stimContainer2">
                <div className="canvasBox">
                  <canvas id="canvas"></canvas>
                </div>
              </div>
              <div className="bottomStim">COLOR</div>
            </div>
          );
        }
      }, ISI);
    }
    if (index >= trials.length) {
      const correctTrials = [];
      for (let i = 0; i < results.length; i++) {
        if (results[i].response == trials[i].correctResponse) {
          correctTrials.push(results[i]);
        }
      }
      accuracy = correctTrials.length / results.length;
      let RTsum = 0;
      let relevantTrials = 0;
      for (let i = 0; i < correctTrials.length; i++) {
        const resp = correctTrials[i].responseTime;
        if (resp) {
          relevantTrials++;
          RTsum += resp;
        }
      }
      avgRT = RTsum / relevantTrials;
      setTarget(
        <div className="message">
          <h1>Congratulations! You have completed the task.</h1>
          <p>
            Your accuracy was {accuracy} and your average response time was{" "}
            {avgRT}.
          </p>
        </div>
      );
    }
  }, [index]);

  React.useEffect(() => {
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
      setPermitResponse(true);
      setStartTime(new Date());
    }
  }, [target]);

  const handleClick = ({ target }) => {
    if (index == -1) {
      setIndex((prev) => prev + 1);
    }
    if (permitResponse) {
      setResponse(target.id);
      setResponseTime(new Date() - startTime);
      setPermitResponse(false);
      setIndex((prev) => prev + 1);
    }
  };

  return (
    <React.Fragment>
      <div className="target">{target}</div>
      <button id="L" className="button" onClick={handleClick}>
        LEFT
      </button>
      <button id="R" className="button" onClick={handleClick}>
        RIGHT
      </button>
    </React.Fragment>
  );
}

root.render(<Display />);
