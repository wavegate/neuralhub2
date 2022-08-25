const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

const trials = [];
const numTrials = 5;
const results = [];
const stimDisplayTime = 36000000;
const stimDelay = 2600;
const ISI = 1600;

for (let i = 0; i < numTrials; i++) {
  trials.push({
    index: i,
    correctResponse: Math.random() < 0.5 ? "L" : "R",
  });
}
console.log(trials);

let accuracy;
let avgRT;

function Display() {
  const [index, setIndex] = React.useState(-1);
  const [target, setTarget] = React.useState(
    <div className="message">
      <h1>Welcome to the mental rotation task!</h1>
      <p>
        In this task, you will see one image on top for a brief moment. You will
        then see two more images displayed underneath. One of these images is
        the rotated version of the one on the top.
      </p>
      <p>
        Your goal is to click the "LEFT" button below if the left bottom image
        is the rotated one, or click the "RIGHT" button if the right bottom
        image is the rotated one.
      </p>
      <p>Respond as quickly and accurately as possible.</p>
      <p>Please click a button below to begin.</p>
    </div>
  );
  const [response, setResponse] = React.useState();
  const [startTime, setStartTime] = React.useState();
  const [responseTime, setResponseTime] = React.useState();
  const [permitResponse, setPermitResponse] = React.useState();
  const [leftOption, setLeftOption] = React.useState();
  const [rightOption, setRightOption] = React.useState();

  React.useEffect(() => {}, []);

  React.useEffect(() => {
    if (index > 0) {
      results.push({
        index: index - 1,
        response: response,
        responseTime: responseTime,
      });
    }
    if (index > -1 && index < trials.length) {
      setTarget();
      setResponse();
      setResponseTime();
      setLeftOption();
      setRightOption();
      const timeout1 = setTimeout(() => {
        setTarget(
          <div className="canvasScreen">
            <canvas id="canvas"></canvas>
          </div>
        );
      }, ISI);
      let timeout2;
      if (trials[index].correctResponse == "L") {
        timeout2 = setTimeout(() => {
          setLeftOption(
            <div className="leftCanvasScreen canvasScreen rotated">
              <canvas id="canvas"></canvas>
            </div>
          );
          setRightOption(
            <div className="rightCanvasScreen canvasScreen">
              <canvas id="canvas"></canvas>
            </div>
          );
          setPermitResponse(true);
          setStartTime(new Date());
        }, stimDelay);
      } else {
        timeout2 = setTimeout(() => {
          setRightOption(
            <div className="rightCanvasScreen canvasScreen rotated">
              <canvas id="canvas"></canvas>
            </div>
          );
          setLeftOption(
            <div className="leftCanvasScreen canvasScreen">
              <canvas id="canvas"></canvas>
            </div>
          );
          setPermitResponse(true);
          setStartTime(new Date());
        }, stimDelay);
      }
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    }
    if (index >= trials.length) {
      setLeftOption();
      setRightOption();
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
    if (leftOption) {
      if (trials[index].correctResponse == "L") {
        const leftCanvasScreen =
          document.getElementsByClassName("leftCanvasScreen")[0];
        const leftCanvas = leftCanvasScreen.querySelector("#canvas");
        const leftCanvasContext = leftCanvas.getContext("2d");
        const canvas = document
          .getElementsByClassName("canvasScreen")[0]
          .querySelector("#canvas");
        leftCanvas.width = leftCanvasScreen.offsetWidth;
        leftCanvas.height = leftCanvasScreen.offsetHeight;
        leftCanvasContext.drawImage(canvas, 0, 0);
      } else {
        const leftCanvasScreen =
          document.getElementsByClassName("leftCanvasScreen")[0];
        const leftCanvas = leftCanvasScreen.querySelector("#canvas");
        leftCanvas.width = leftCanvasScreen.offsetWidth;
        leftCanvas.height = leftCanvasScreen.offsetHeight;
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
      const timeoutID = setTimeout(() => {
        setLeftOption();
        setIndex((prev) => prev + 1);
      }, stimDisplayTime);

      return () => {
        clearTimeout(timeoutID);
      };
    }
  }, [leftOption]);

  React.useEffect(() => {
    if (rightOption) {
      if (trials[index].correctResponse == "R") {
        const rightCanvasScreen =
          document.getElementsByClassName("rightCanvasScreen")[0];
        const rightCanvas = rightCanvasScreen.querySelector("#canvas");
        const rightCanvasContext = rightCanvas.getContext("2d");
        const canvas = document
          .getElementsByClassName("canvasScreen")[0]
          .querySelector("#canvas");
        rightCanvas.width = rightCanvasScreen.offsetWidth;
        rightCanvas.height = rightCanvasScreen.offsetHeight;
        rightCanvasContext.drawImage(canvas, 0, 0);
      } else {
        const rightCanvasScreen =
          document.getElementsByClassName("rightCanvasScreen")[0];
        const rightCanvas = rightCanvasScreen.querySelector("#canvas");
        rightCanvas.width = rightCanvasScreen.offsetWidth;
        rightCanvas.height = rightCanvasScreen.offsetHeight;
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
      const timeoutID = setTimeout(() => {
        setRightOption();
        setIndex((prev) => prev + 1);
      }, stimDisplayTime);
      return () => {
        clearTimeout(timeoutID);
      };
    }
  }, [rightOption]);

  React.useEffect(() => {
    let canvasScreen = document.getElementsByClassName("canvasScreen");
    if (canvasScreen.length > 0) {
      canvasScreen = canvasScreen[0];
      const canvas = canvasScreen.querySelector("#canvas");
      if (canvas) {
        const ctx = canvas.getContext("2d");
        canvas.width = canvasScreen.offsetWidth;
        canvas.height = canvasScreen.offsetHeight;
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

  const handleClick = ({ target }) => {
    if (index == -1) {
      setIndex((prev) => prev + 1);
    } else if (index <= trials.length && permitResponse) {
      setIndex((prev) => prev + 1);
      setPermitResponse(false);
      setResponse(target.id);
      setResponseTime(new Date() - startTime);
    }
  };

  return (
    <React.Fragment>
      <div className="target">{target}</div>
      <div className="leftOption">{leftOption}</div>
      <div className="rightOption">{rightOption}</div>
      <button className="button" id="L" onClick={handleClick}>
        LEFT
      </button>
      <button className="button" id="R" onClick={handleClick}>
        RIGHT
      </button>
    </React.Fragment>
  );
}

root.render(<Display />);
