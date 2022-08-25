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
const maxStimDisplayTime = 500;
const ISI = 1000;
const maxRT = 1600;
const minRT = 100;
// const numTrials = 156;
// const numBlocks = 2;
const numTrials = 20;

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

function createTrials() {
  for (let i = 0; i < numTrials; i++) {
    const dice = Math.floor(Math.random() * 9 + 1);
    trials.push({
      index: i,
      correctResponse: dice,
      count: dice,
    });
  }
}

createTrials();
console.log(trials);
let clicked = false;
let responseTime;

const Target = (props) => {
  const [index, setIndex] = React.useState(-1);
  const [shape, setShape] = React.useState("+");
  const [response, setResponse] = React.useState(null);
  const [startTime, setStartTime] = React.useState(new Date());

  React.useEffect(() => {
    if (index == -1) {
      setShape(
        <div className="message">
          <h1>Welcome to the subitizing task.</h1>
          <p>
            In this test, you will be presented with a word in either the color
            green or the color red.
          </p>
          <p>
            Your goal is to click the green button below whenever you see a word
            that is the COLOR green (ignore what the text says!), and click the
            red button below whenever you see a word that is the COLOR red.
          </p>
          <img src={instructionsPath} />
          <p>Respond as quickly and accurately as you can.</p>
          <p>Please click one of the buttons below to begin.</p>
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
        setShape(<canvas id="basicCanvas"></canvas>);
        setStartTime(new Date());
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
          localStorage.setItem("subitizing", score);
          console.log("final score: " + localStorage.getItem("subitizing"));
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
              . This puts your enumeration at the {score.toFixed(0)}
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
      const intervalID = setInterval(() => {
        setIndex((prev) => prev + 1);
      }, ISI);
      return () => clearInterval(intervalID);
    } else {
      const canvas = document.getElementById("basicCanvas");

      if (canvas) {
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext("2d");
        const numDots = trials[index].count;

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
    }
  };

  return (
    <React.Fragment>
      <div className="target">{shape}</div>
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
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Target />);
