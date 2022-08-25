let trials = [];
let resultTrials = [];
const options = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const pickRandom = (array) => {
  return Math.floor(Math.random() * array.length);
};
let sequence = [];
let responseTimes = [];
let responses = [];
const percentTargets = 0.8;
// const maxStimDisplayTime = 1600;
const maxStimDisplayTime = 9000000;
const ISI = 1000;
const maxRT = 1600;
const minRT = 100;
// const numTrials = 156;
// const numBlocks = 2;
const numTrials = 5;

const accuracyMean = 0.95;
const accuracySD = 0.02;
const RTMean = 500;
const RTSD = 200;

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

const colorChoices = [
  [255, 0, 0],
  [255, 128, 0],
  [255, 255, 0],
  [0, 255, 0],
  [0, 255, 255],
  [0, 0, 255],
  [255, 0, 255],
];

function getRndColor() {
  //   var r = (255 * Math.random()) | 0,
  //     g = (255 * Math.random()) | 0,
  //     b = (255 * Math.random()) | 0;
  //   return "rgb(" + r + "," + g + "," + b + ")";
  const pick = Math.floor(Math.random() * 7);
  const pickColor = colorChoices[pick];
  return "rgb(" + pickColor[0] + "," + pickColor[1] + "," + pickColor[2] + ")";
}

function createTrials() {
  for (let i = 0; i < numTrials; i++) {
    const dice = Math.floor(Math.random() * 10);
    const dice2 = Math.floor(Math.random() * 10);
    trials.push({
      index: i,
      position: [dice, dice2],
      correctResponse: "invisButton",
    });
  }
}

createTrials();
console.log(trials);
let clicked = false;
let responseTime;

const Target = (props) => {
  const [index, setIndex] = React.useState(-1);
  const [shape, setShape] = React.useState("");
  const [response, setResponse] = React.useState(null);
  const [startTime, setStartTime] = React.useState(new Date());

  React.useEffect(() => {
    if (index == -1) {
      setShape(
        <div className="message">
          <h1>Welcome to the visual search task.</h1>
          <p>
            In this test, you will be presented with an array of colored dots.
          </p>
          <p>Your goal is to click the black dot.</p>
          <img src={instructionsPath} />
          <p>Respond as quickly and accurately as you can.</p>
          <p>Please click the START button below to begin.</p>
        </div>
      );
    } else {
      if (index > 0) {
        resultTrials.push({
          index: index - 1,
          response: response ? response : "N",
          responseTime:
            responseTime > minRT && responseTime < maxRT ? responseTime : null,
        });
      }
      if (index < trials.length) {
        setShape("");
        const canvas = document.getElementById("basicCanvas");
        const canvasContainer = document.getElementById("canvasContainer");
        canvasContainer.style.display = "block";

        if (canvas) {
          canvas.width = canvasContainer.offsetWidth;
          canvas.height = canvasContainer.offsetWidth;
          const ctx = canvas.getContext("2d");

          function drawCircle(x, y, color) {
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.fill();
          }
          for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
              if (
                i == trials[index].position[0] &&
                j == trials[index].position[1]
              ) {
                const invisButton = document.getElementById("invisButton");
                invisButton.style.left = `${
                  (i / 10) * (canvas.width - 50) + 50
                }px`;
                invisButton.style.top = `${
                  (j / 10) * (canvas.height - 50) + 50
                }px`;
                drawCircle(
                  (i / 10) * (canvas.width - 50) + 50,
                  (j / 10) * (canvas.height - 50) + 50,
                  "rgb(0,0,0)"
                );
              } else {
                drawCircle(
                  (i / 10) * (canvas.width - 50) + 50,
                  (j / 10) * (canvas.height - 50) + 50,
                  getRndColor()
                );
              }
            }
          }
        }
        setStartTime(new Date());
        // document.getElementById("invisButton").click();
        setResponse(null);
        clicked = false;
        responseTime = null;
        const intervalID = setInterval(() => {
          setShape("+");
        }, maxStimDisplayTime);
        return () => clearInterval(intervalID);
      } else {
        console.log(resultTrials);
        const correctTrials = [];
        for (let i = 0; i < resultTrials.length; i++) {
          if (resultTrials[i].response == trials[i].correctResponse) {
            correctTrials.push(resultTrials[i]);
          }
        }
        let accuracy;
        let avgRT;
        let score;
        if (correctTrials.length > 0) {
          accuracy = correctTrials.length / resultTrials.length;
          let responseTimes = 0;
          let relevantTrials = 0;
          for (let trial of correctTrials) {
            if (trial.responseTime) {
              responseTimes += trial.responseTime;
              relevantTrials++;
            }
          }
          avgRT = responseTimes / relevantTrials;
          console.log(`accuracy: ${accuracy}`);
          console.log(`avgRT: ${avgRT}`);
          const accuracyZ = (accuracy - accuracyMean) / accuracySD;
          const RTZ = (RTMean - avgRT) / RTSD;
          const accuracyScore = GetZPercent(accuracyZ);
          const RTScore = GetZPercent(RTZ);
          console.log(accuracyScore);
          console.log(RTScore);
          score = (accuracyScore * 0.5 + RTScore * 0.5) * 100;
          localStorage.setItem("visual_search", score);
          console.log("final score: " + localStorage.getItem("visual_search"));
        } else {
          accuracy = 0;
          avgRT = null;
        }
        setShape(
          <div className="message">
            <h1>Congratulations, you have completed the test.</h1>
            <p>
              Your accuracy was{" "}
              {(accuracy * 100).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
              %
              {avgRT > 0
                ? ` and your average reaction time
                      was ${avgRT.toFixed(0)} milliseconds`
                : ""}
              . This puts your visual search at the {score.toFixed(0)}
              th percentile!
            </p>
            <p>You are free to close this window.</p>
          </div>
        );
      }
    }
  }, [index]);
  React.useEffect(() => {
    if (shape === "+") {
      document.getElementById("canvasContainer").style.display = "none";
      const intervalID = setInterval(() => {
        setIndex((prev) => prev + 1);
      }, ISI);
      return () => clearInterval(intervalID);
    }
  }, [shape]);
  const handleClick = ({ target }) => {
    if (index == -1) {
      setIndex(0);
    } else if (!clicked) {
      setResponse(target.id);
      const endTime = new Date();
      clicked = true;
      responseTime = endTime - startTime;
      setShape("+");
    }
  };

  return (
    <React.Fragment>
      <div className="shape">{shape}</div>
      <div id="canvasContainer">
        <button id="invisButton" onClick={handleClick}></button>
        <canvas id="basicCanvas"></canvas>
      </div>
      <button id="Y" className="button" onClick={handleClick}>
        START
      </button>
    </React.Fragment>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Target />);
