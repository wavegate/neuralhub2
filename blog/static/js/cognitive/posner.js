const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

const numTrials = 5;
const percentageCued = 0.5;
const cueDelay = 800;
const stimDelay = 1600;
const stimDuration = 1600;
const ISI = 600;
const minRT = 100;
const maxRT = 1600;

const accuracyMean = 0.95;
const accuracySD = 0.02;
const RTMean = 400;
const RTSD = 100;

// set up trials
const trials = [];
for (let i = 0; i < numTrials; i++) {
  trials.push({
    index: i,
    correctResponse: Math.random() < 0.5 ? "L" : "R",
    cued: Math.random() < percentageCued ? true : false,
  });
}
console.log(trials);

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

const results = [];
let accuracy = 99;
let avgRT;
let score;

function Display() {
  const initialMessage = (
    <div className="message">
      <h1>Welcome to the Posner cuing task!</h1>
      <p>
        In this task, you will be presented with a target in the shape of an
        asterisk ("*") either to the left or to the right of the center cross.
      </p>
      <p>
        Your goal is to click the "LEFT" button if the target appears on the
        left, and to click on the "RIGHT" button if the target appears on the
        right.
      </p>
      <p>
        Occasionally, an arrow will appear above the cross to indicate in which
        direction the target will appear.
      </p>
      <p>Respond as quickly and accurately as possible.</p>
      <p>Please click one of the buttons below to start.</p>
    </div>
  );
  const [cross, setCross] = React.useState(initialMessage);
  const [cue, setCue] = React.useState("");
  const [stim, setStim] = React.useState("");
  const [index, setIndex] = React.useState(-1);
  const [startTime, setStartTime] = React.useState();
  const [permitResponse, setPermitResponse] = React.useState(false);
  const [responseTime, setResponseTime] = React.useState();
  const [response, setResponse] = React.useState();
  const finishMessage = () => {
    return (
      <div className="message">
        <h1>Congratulations! You have completed the task.</h1>
        <p>
          Your accuracy for this task was {(accuracy * 100).toFixed(2)} and your
          average reaction time was {avgRT.toFixed(0)} milliseconds, making your
          final score {score.toFixed(0)}!
        </p>
      </div>
    );
  };

  React.useEffect(() => {
    if (index > 0) {
      results.push({
        index: index - 1,
        response: response,
        responseTime: responseTime,
      });
    }
    if (index > -1 && index < trials.length) {
      setCross("+");
      setStim("");
      setCue("");
      setPermitResponse(false);
      setStartTime(new Date());
      setResponse("");
      setResponseTime("");
      const trialDirection = trials[index].correctResponse;
      if (trials[index].cued) {
        setTimeout(
          () => (trialDirection == "L" ? setCue("<---") : setCue("--->")),
          cueDelay
        );
      }
      setTimeout(
        () =>
          trialDirection == "L"
            ? setStim(<span className="stimLeft">*</span>)
            : setStim(<span className="stimRight">*</span>),
        stimDelay
      );
    }
    if (index >= trials.length) {
      console.log(results);
      setStim("");
      setCue("");
      const correctTrials = [];
      for (let i = 0; i < results.length; i++) {
        if (results[i].response == trials[i].correctResponse) {
          correctTrials.push(results[i]);
        }
      }
      if (correctTrials.length > 0) {
        accuracy = correctTrials.length / results.length;
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
        localStorage.setItem("posner", score);
        console.log("final score: " + localStorage.getItem("posner"));
      } else {
        accuracy = 0;
        avgRT = null;
      }
      setCross(finishMessage());
    }
  }, [index]);

  React.useEffect(() => {
    if (stim) {
      setStartTime(new Date());
      setPermitResponse(true);
      setTimeout(() => {
        setIndex((prev) => prev + 1);
      }, stimDuration);
    }
  }, [stim]);

  const handleClick = (event) => {
    if (permitResponse) {
      setResponseTime(new Date() - startTime);
      setResponse(event.target.id);
      setPermitResponse(false);
    }
    if (index == -1) {
      setIndex((prev) => prev + 1);
    }
  };

  return (
    <React.Fragment>
      <div className="cue">{cue}</div>
      <div className="cross">{cross}</div>
      <div className="stim">{stim}</div>
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
