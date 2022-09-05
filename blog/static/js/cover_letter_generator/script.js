const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

const Output = (props) => {
  const [date, setDate] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [content, setContent] = React.useState();

  React.useEffect(() => {
    const re = /\w+ (\w+)/;
    let lastName = "";
    if (props.to_name) {
      const match = props.to_name.match(re);
      if (match) {
        lastName = match[1];
      }
    }
    const date = new Date(props.date.replace(/-/g, "/")).toLocaleDateString(
      "en-US"
    );
    setLastName(lastName);
    setDate(date);
    setContent(
      <div className="cover-letter">
        <link href="/static/css/weasyprint.css" rel="stylesheet" />
        <p className="date">{date}</p>
        <div className="intro">{props.company_name}</div>
        <div className="intro">{props.to_address_1}</div>
        <div className="intro">{props.to_address_2}</div>
        <div className="intro">{props.to_phone}</div>
        <div className="intro">{props.to_email}</div>
        <p>Dear {props.to_name},</p>
        <p>
          I am a web developer applying for your web developer position.
          Although my background is in medicine, web development is my passion.
          I've practiced frontend (HTML/CSS, JavaScript + React, responsive UI
          design, fetch) as well as backend (databases, REST APIs,
          authentication using Django). I have deployed and managed several
          full-stack production projects using Git and Heroku, all of which can
          be found on my portfolio at <a href="https://flee.dev">flee.dev</a>. I
          am continuing my study of engineering as an online Master's student in
          Computer Science. I believe I have a strong foundation as an
          independent, basic frontend or full-stack web developer and am ready
          to contribute to larger projects.
        </p>
        <div>Sincerely,</div>
        <img src="/static/img/cover_letter_generator/signature.png"></img>
        <div>Frank Lee</div>
        <div>{props.from_phone}</div>
        <div>{props.from_email}</div>
      </div>
    );
  }, [props]);

  const getPDF = async () => {
    var filename = `${props.company_name}_CoverLetter_FrankLee.pdf`;
    const data = {
      content: ReactDOMServer.renderToStaticMarkup(content),
    };
    const button = document.getElementById("getPDFButton");
    const loading = document.getElementById("loading");
    button.style.display = "none";
    loading.style.visibility = "visible";
    const response = await fetch("/generate_pdf/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(data),
    });
    button.style.display = "inline-flex";
    loading.style.visibility = "hidden";
    const blob = await response.blob();
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display:none";
    var prl = window.URL.createObjectURL(blob);
    a.href = prl;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(prl);
    a.remove();
  };

  return (
    <React.Fragment>
      {content}
      <button onClick={getPDF} className="button" id="getPDFButton">
        Get PDF
      </button>
      <img
        src="/static/img/cover_letter_generator/loading.webp"
        width="30px"
        height="30px"
        className="loading"
        id="loading"
      ></img>
    </React.Fragment>
  );
};

function Form() {
  const [content, setContent] = React.useState({
    company_name: "",
    date: new Date().toISOString().split("T")[0],
    to_sub: "",
    to_name: "Hiring Manager",
    to_address_1: "",
    to_address_2: "",
    to_phone: "",
    to_email: "",
    from_phone: "",
    from_email: "",
  });
  const handleChange = (event) => {
    setContent((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <React.Fragment>
      <div className="formBlock">
        <div className="formGroup">
          <label htmlFor="company_name">Company Name</label>
          <input
            type="text"
            name="company_name"
            id="company_name"
            onChange={handleChange}
            value={content.company_name || ""}
          ></input>
        </div>
        <div className="formGroup">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            name="date"
            id="date"
            onChange={handleChange}
            value={content.date || ""}
          ></input>
        </div>
        <div className="formGroup">
          <label htmlFor="to_sub">Prefix</label>
          <input
            type="text"
            name="to_sub"
            id="to_sub"
            onChange={handleChange}
            value={content.to_sub || ""}
          ></input>
        </div>
        <div className="formGroup">
          <label htmlFor="to_name">Hiring Manager's Name</label>
          <input
            type="text"
            name="to_name"
            id="to_name"
            onChange={handleChange}
            value={content.to_name || ""}
          ></input>
        </div>
        <div className="formGroup">
          <label htmlFor="to_address_1">Company Address Line 1</label>
          <input
            type="text"
            name="to_address_1"
            id="to_address_1"
            onChange={handleChange}
            value={content.to_address_1 || ""}
          ></input>
        </div>
        <div className="formGroup">
          <label htmlFor="to_address_2">Company Address line 2</label>
          <input
            type="text"
            name="to_address_2"
            id="to_address_2"
            onChange={handleChange}
            value={content.to_address_2 || ""}
          ></input>
        </div>
        <div className="formGroup">
          <label htmlFor="to_phone">Their Phone</label>
          <input
            type="text"
            name="to_phone"
            id="to_phone"
            onChange={handleChange}
            value={content.to_phone || ""}
          ></input>
        </div>
        <div className="formGroup">
          <label htmlFor="to_email">Their Email</label>
          <input
            type="text"
            name="to_email"
            id="to_email"
            onChange={handleChange}
            value={content.to_email || ""}
          ></input>
        </div>
        <div className="formGroup">
          <label htmlFor="from_phone">My Phone</label>
          <input
            type="text"
            name="from_phone"
            id="from_phone"
            onChange={handleChange}
            value={content.from_phone || ""}
          ></input>
        </div>
        <div className="formGroup">
          <label htmlFor="from_email">My Email</label>
          <input
            type="text"
            name="from_email"
            id="from_email"
            onChange={handleChange}
            value={content.from_email || ""}
          ></input>
        </div>
      </div>
      <Output
        company_name={content.company_name}
        date={content.date}
        prefix={content.to_sub}
        to_name={content.to_name}
        to_address_1={content.to_address_1}
        to_address_2={content.to_address_2}
        to_phone={content.to_phone}
        to_email={content.to_email}
        from_phone={content.from_phone}
        from_email={content.from_email}
      />
    </React.Fragment>
  );
}
root.render(<Form />);
