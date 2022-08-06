const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: "<p>Hello World!</p>",
      language: "html",
      result: "",
      preview: "",
      style: "",
      file: "",
      lines: "",
    };
  }

  componentDidMount = async () => {
    let dataLine = "";
    if (this.state.lines) {
      dataLine = ` data-line="${this.state.lines}"`;
    }
    let dataFile = "";
    if (this.state.file) {
      dataFile = ` data-file="${this.state.file}"`;
    }
    let output = escapeHtml(this.state.code);
    let result = `<pre${dataLine}${dataFile}>
<code class="language-${this.state.language}">
${output}
</code>
</pre>`;
    let languageName = "language-" + this.state.language;
    let preview = (
      <pre
        className={languageName}
        data-file={this.state.file || null}
        data-line={this.state.lines || null}
      >
        <code className={languageName}>{this.state.code}</code>
      </pre>
    );
    if (this.state.style == "inline") {
      result = `<code class="language-${this.state.language}">
${output}
</code>`;
      preview = <code className={languageName}>{this.state.code}</code>;
    }
    await this.setState(
      { result: result, preview: preview },
      Prism.highlightAll
    );
  };

  handleChange = async (event) => {
    const value = event.target.value;
    const name = event.target.name;
    await this.setState({ [name]: value });
    let dataLine = "";
    if (this.state.lines) {
      dataLine = ` data-line="${this.state.lines}"`;
    }
    let dataFile = "";
    if (this.state.file) {
      dataFile = ` data-file="${this.state.file}"`;
    }
    let output = escapeHtml(this.state.code);
    let result = `<pre${dataLine}${dataFile}>
<code class="language-${this.state.language}">
${output}
</code>
</pre>`;
    let languageName = "language-" + this.state.language;
    let preview = (
      <pre
        className={languageName}
        data-file={this.state.file || null}
        data-line={this.state.lines || null}
      >
        <code className={languageName}>{this.state.code}</code>
      </pre>
    );
    if (this.state.style == "inline") {
      result = `<code class="language-${this.state.language}">
${output}
</code>`;
      preview = <code className={languageName}>{this.state.code}</code>;
    }
    await this.setState(
      { result: result, preview: preview },
      Prism.highlightAll
    );
  };

  render() {
    return (
      <div>
        <form>
          <h2>Paste in code to be highlighted</h2>
          <p>
            First, enter the code block or inline snippet you wish to highlight.
            A default example is pre-populated:
          </p>
          <textarea
            name="code"
            value={this.state.code}
            onChange={this.handleChange}
          />
          <p>Select the language the code is written in:</p>
          <select
            value={this.state.language}
            onChange={this.handleChange}
            name="language"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="c">C</option>
            <option value="csharp">C#</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="php">PHP</option>
            <option value="markdown">Markdown</option>
            <option value="visual-basic">Visual Basic</option>
            <option value="sql">SQL</option>
            <option value="r">R</option>
            <option value="django">Django/Jinja2</option>
            <option value="ruby">Ruby</option>
            <option value="swift">Swift</option>
            <option value="typescript">TypeScript</option>
            <option value="wolfram">Wolfram language</option>
          </select>
          <p>Choose if you want the code in block or inline form:</p>
          <select
            value={this.state.style}
            onChange={this.handleChange}
            name="style"
          >
            <option value="block">Block</option>
            <option value="inline">Inline</option>
          </select>
          <h2>Additional options</h2>
          <p>
            If the code is associated with a specific file, specify the file
            path here. This creates a small tag in the upper-right corner with
            the file path:
          </p>
          <input
            type="text"
            name="file"
            value={this.state.file}
            onChange={this.handleChange}
          ></input>
          <p>
            Enter values here if you want to highlight specific lines. For
            example, if you want to highlight lines 3, 4, 6, 7, 8, then write
            "3-4,6-8". Be careful not to enter any non-numeric characters as
            this currently breaks the page and I haven't gotten around to fixing
            it yet:
          </p>
          <input
            type="text"
            name="lines"
            value={this.state.lines}
            onChange={this.handleChange}
          ></input>
        </form>
        <h2>Code result and preview</h2>
        <p>
          Here is the resulting code you can now copy and paste into your HTML
          file. To be clear, you do need to install Prism.js in order for this
          code to work. If you're not sure how to do this, please see
          instructions below on how to do exactly that.
        </p>
        <textarea value={this.state.result} readOnly></textarea>
        <p>
          Here's an example of how your code will show up after being processed
          by Prism.js:
        </p>
        <div>{this.state.preview}</div>
      </div>
    );
  }
}

const element = <Form />;

root.render(element);
