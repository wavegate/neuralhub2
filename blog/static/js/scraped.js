const initData = {
  stack: {
    "full-stack": ["full[-\\s]?stack", 144],
    "front-end": ["front[-\\s]?end", 291],
    "back-end": ["back[-\\s]?end", 207],
    "UI/UX": ["ui/ux", 69],
    DevOps: ["devops", 80],
  },
  experience: {
    junior: ["(junior)|(entry)", 57],
    "mid-level": ["mid", 31],
    senior: ["senior", 158],
  },
  language: {
    HTML: ["html", 307],
    CSS: ["css", 308],
    JavaScript: ["(javascript)|(js)", 506],
    TypeScript: ["typescript", 132],
    PHP: ["php", 68],
    Java: ["\\bjava\\b", 267],
    Python: ["python", 221],
    Kotlin: ["kotlin", 18],
    Swift: ["swift", 20],
    Dart: ["dart", 3],
    "C#": ["c#", 74],
    C: ["\\bc\\b", 154],
    "C++": ["c\\+\\+", 68],
    R: ["\\br\\b", 37],
    Lua: ["lua", 106],
    Go: ["[.\\s]go[.\\s]", 36],
    Rust: ["rust", 79],
    Ruby: ["ruby", 49],
    Perl: ["perl", 32],
    Clojure: ["clojure", 9],
    Scala: ["\\bscala\\b", 8],
  },
  frontend: {
    React: ["react", 310],
    Angular: ["angular", 198],
    Vue: ["vue", 64],
    Ember: ["\\bember", 10],
    Svelte: ["svelte", 3],
    jQuery: ["jquery", 85],
    WebAssembly: ["(web\\s?assembly)|(wasm)", 5],
    Next: ["next.js", 10],
    Gatsby: ["gatsby", 2],
  },
  backend: {
    Django: ["django", 37],
    Flask: ["flask", 13],
    "Ruby on Rails": ["rails", 18],
    "ASP.net": ["(asp.net)|(\\b.net\\b)", 45],
    Spring: ["spring", 84],
    Express: ["express", 136],
    Laravel: ["laravel", 5],
  },
  education: {
    "Bachelor's": ["(bachelor[\\']?s)|(\\bba\\b)|(\\bbs\\b)", 273],
    "Master's": ["(master[\\']?s)|(\\bms\\b)", 169],
    PhD: ["(phd)|(doctor)", 35],
  },
  database: {
    Oracle: ["oracle", 61],
    MySQL: ["mysql", 106],
    PostgreSQL: ["postgresql", 43],
    "MS SQL": ["(ms\\s?sql)|(microsoft sql)", 20],
    SQLite: ["sqlite", 7],
    MongoDB: ["mongodb", 39],
    Redis: ["redis", 21],
    MariaDB: ["maria", 5],
    Firebase: ["firebase", 1],
    Cassandra: ["cassandra", 18],
    DB2: ["db2", 3],
    Elasticsearch: ["elasticsearch", 14],
    GraphQL: ["graphql", 33],
  },
  css_framework: {
    Bootstrap: ["bootstrap", 51],
    Tailwind: ["tailwind", 6],
    Material: ["material", 49],
    SASS: ["(scss)|(sass)", 54],
    LESS: ["\\bless\\b", 53],
  },
  CMS: {
    Wordpress: ["wordpress", 14],
    Drupal: ["drupal", 13],
    Joomla: ["joomla", 2],
    Magento: ["magento", 5],
  },
  bundler: {
    Webpack: ["webpack", 44],
    Parcel: ["parcel", 3],
    Rollup: ["rollup", 1],
    Browserify: ["browserify", 3],
  },
  cloud: {
    AWS: ["aws", 251],
    "Google cloud": ["google cloud", 34],
    Azure: ["azure", 95],
    Heroku: ["heroku", 3],
  },
  container: {
    Docker: ["docker", 118],
    Kubernetes: ["kubernetes", 104],
  },
  testing_framework: {
    Jest: ["jest", 26],
    Mocha: ["mocha", 16],
    Cypress: ["cypress", 24],
    Enzyme: ["enzyme", 2],
  },
};

class DictUtils {
  static entries(dictionary) {
    try {
      //ECMAScript 2017 and higher, better performance if support
      return Object.entries(dictionary);
    } catch (error) {
      //ECMAScript 5 and higher, full compatible but lower performance
      return Object.keys(dictionary).map(function (key) {
        return [key, dictionary[key]];
      });
    }
  }

  static sort(dictionary, sort_function) {
    return DictUtils.entries(dictionary)
      .sort(sort_function)
      .reduce((sorted, kv) => {
        sorted[kv[0]] = kv[1];
        return sorted;
      }, {});
  }
}

class SortFunctions {
  static compare(o0, o1) {
    //TODO compelte for not-number values
    return o0[1] - o1[1];
  }
  static byValueDescending(kv0, kv1) {
    return SortFunctions.compare(kv1[1], kv0[1]);
  }
  static byValueAscending(kv0, kv1) {
    return SortFunctions.compare(kv0[1], kv1[1]);
  }
}

const chart = (input, topic) => {
  const labels = [];
  const values = [];
  for (const [key, value] of Object.entries(input)) {
    labels.push(key);
    values.push(value[1]);
  }
  const data = {
    labels: labels,
    datasets: [
      {
        label: topic,
        data: values,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(255, 205, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(201, 203, 207, 0.2)",
        ],
        borderColor: [
          "rgb(255, 99, 132)",
          "rgb(255, 159, 64)",
          "rgb(255, 205, 86)",
          "rgb(75, 192, 192)",
          "rgb(54, 162, 235)",
          "rgb(153, 102, 255)",
          "rgb(201, 203, 207)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const config = {
    type: "bar",
    data,
    options: {
      indexAxis: "y",
    },
  };

  new Chart(document.getElementById(topic), config);
};

for (const [key, value] of Object.entries(initData)) {
  chart(DictUtils.sort(value, SortFunctions.byValueDescending), key);
}
