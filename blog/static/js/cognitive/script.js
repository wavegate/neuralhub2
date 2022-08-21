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

let stimTrial = {
  index: 0,
  shape: "Z",
  correctResponse: "Y",
};

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
                      was ${avgRT} milliseconds`
                : ""}
              .
            </p>
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
