//dependency: https://unpkg.com/simple-statistics@7.7.6/dist/simple-statistics.min.js

let trials = [];
let resultTrials = [];
const options = ["N", "B", "C", "Z", "D", "E"];
const pickRandom = (array) => {
  return Math.floor(Math.random() * array.length);
};
let sequence = [];
let responseTimes = [];
let responses = [];
const percentTargets = 0.5;
const stimDisplayTime = 300;
const ISI = 1500;
const maxRT = 1200;
const minRT = 100;
// const numTrials = 156;
// const numBlocks = 2;
const numTrials = 10;

const accuracyMean = 0.85;
const accuracySD = 0.05;
const RTMean = 1100;
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
        correctResponse: "N",
      });
    }
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
          <h1>Welcome to the 2-back test.</h1>
          <p>In this test, you will be presented with a sequence of letters.</p>
          <p>
            Your goal is to click the "YES" button below only when the letter
            presented is the same letter as that presented two letters previous.
          </p>
          <img src={instructionsPath} />
          <p>Respond as quickly and accurately as you can.</p>
          <p>Please click the "YES" button to begin.</p>
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
        setShape(trials[index].shape);
        setStartTime(new Date());
        setResponse(null);
        clicked = false;
        responseTime = null;
        const intervalID = setInterval(() => {
          setShape("+");
        }, stimDisplayTime);
        return () => clearInterval(intervalID);
      } else {
        console.log(resultTrials);
        const correctTrials = [];
        for (let i = 2; i < resultTrials.length; i++) {
          if (resultTrials[i].response == trials[i].correctResponse) {
            correctTrials.push(resultTrials[i]);
          }
        }
        let accuracy;
        let avgRT;
        let score;
        if (correctTrials.length > 0) {
          accuracy = correctTrials.length / (resultTrials.length - 2);
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
          score = ((accuracyScore + RTScore) / 2) * 100;
          localStorage.setItem("twoback", score);
          console.log("final score: " + localStorage.getItem("twoback"));
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
                      was ${avgRT.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                      })} milliseconds`
                : ""}
              . This puts your working memory at the {score.toFixed(0)}
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
      <button id="Y" className="button" onClick={handleClick}>
        YES
      </button>
      {/* <button id="noButton" className="button" onClick={handleClick}>
        NO
      </button> */}
    </React.Fragment>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Target />);
