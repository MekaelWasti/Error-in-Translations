import React, { useState, useRef } from "react";
// import loadingIconGrey from './assets/loading_icon_grey.svg';
import loadingIconWhite from "./assets/loading_icon_white.svg";
// import parse from 'html-react-parser';
import DOMPurify from "dompurify";
import "./App.css";
import "./index.css";

const App: React.FC = () => {
  const sourceTextRef = useRef(null);
  const translationTextRef = useRef<HTMLDivElement | null>(null);

  const [sanitizedHtmlString, setSanitizedHtmlString] = useState(
    "<span><span class='highlight' style='background-color: #00A0F0; padding: 0vh 0vw 0vh 0vw; zIndex: 0'>Student</span>s from Stanford University Medical School an<span class='highlight' style='background-color: #D3365A; padding: 1vh 0vw 1vh 0vw; zIndex: 1'>nounced Monday the invention of a new diag<span class='highlight' style='background-color: #59c00aba; padding: 2vh 0vw 2vh 0vw; zIndex: 2'>nostic tool tha</span></span>t can sort cells by type of small printed chip</span>"
  );

  const [sourceTextInput, setSourceTextInput] = useState(
    "Kuwa mbere, abahanga ba siyansi bo mu Ishuri rikuru ry’ubuvuzi rya kaminuza ya Stanford bataganje ko havumbuwe igikoresho gishya cyo gusuzuma gishobora gutandukanya ingirabuzima"
  );
  const [translation, setTranslation] = useState("");
  const [error_type, setErrorType] = useState("Incorrect Subject");
  const [isLoading, setIsLoading] = useState(false);
  const [popupStyle, setPopupStyle] = useState({
    top: 0,
    left: 0,
    display: "none",
  });

  const handleInputBoxChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const userInput = e.currentTarget.value;
    setSourceTextInput(userInput);
  };

  const handleSubmission = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    sendTranslation(sourceTextInput);
    setIsLoading(true);
  };

  const sendTranslation = async (userInput: string) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:63030/submit_translation/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value: userInput }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIsLoading(false);
      setTranslation(data.response);

      console.log(data.highlights);
      const sanitized = DOMPurify.sanitize(data.highlights);
      setSanitizedHtmlString(sanitized);
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  const handleMouseEnter = (event: React.MouseEvent) => {
    console.log("ENTERED");
    setPopupStyle({
      top: event.clientY + 30,
      left: event.clientX - 150,
      display: "block",
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    // console.log("MOVING", event.clientX, event.clientY);
    setPopupStyle({
      top: event.clientY + 375,
      left: event.clientX - 150,
      display: "block",
    });
  };

  const handleMouseLeave = () => {
    console.log("LEFT");
    setPopupStyle({ ...popupStyle, display: "none" });
  };
  
  const [value1, setValue1] = useState<number>(50);
  const [value2, setValue2] = useState<number>(50);
  const [spanScores, setSpanScores] = useState<{ [key: string]: number }>({});

  const handleChange1 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue1(Number(event.target.value));
  };

  const handleChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue2(Number(event.target.value));
  };

  const handleSpanClick = (index: number) => {
    setSpanScores((prevScores) => ({ ...prevScores, [index]: value1 }));
  };

  const injectOnClickHandler = (htmlString: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const spans = doc.querySelectorAll('.highlight');
    spans.forEach((span, index) => {
      span.setAttribute('onClick', `handleSpanClick(${index})`);
      span.setAttribute('data-index', index.toString());
    });
    return doc.body.innerHTML;
  };

  const enhancedHtmlString = injectOnClickHandler(sanitizedHtmlString);
 
	

  return (
    <div className="landing-page-parent">
      <div className="navbar">
        <ul className="navbar-contents">
          <li className="navbar-item">
            <img className="logo" src="favicon.svg" alt="" />
            <a className="navbar-item-name" href="http://localhost:5173">
              Translation Error
            </a>
          </li>
        </ul>
      </div>
      <div className="input-and-button">
        <div className="input-container">
          <div className="wrapper">
            <ul className="language-bar">
              <li className="from-languages">
                <select>
                  <option value="en-US">English</option>
                  <option value="hi-IN">Hindi</option>
                  <option value="ne-NP">Nepali</option>
                </select>
              </li>
              <li className="to-languages">
                <select>
                  <option value="zh-TW">Chinese (Traditional)</option>
                  <option value="en-US">English</option>
                  <option value="hi-IN">Hindi</option>
                  <option value="ne-NP">Nepali</option>
                </select>
              </li>
            </ul>
            <div className="text-input">
              <textarea
                className="from-text"
                onChange={handleInputBoxChange}
                placeholder="Type to translate"
              ></textarea>
              <div className="to-text-container">
                <textarea
                  className={`to-text ${
                    isLoading ? "loading-icon-hidden" : ""
                  }`}
                  value={translation}
                  placeholder="Translated text appears here"
                  readOnly
                  disabled
                ></textarea>
                <img
                  className={`loading-icon ${
                    isLoading ? "" : "loading-icon-hidden"
                  }`}
                  src={loadingIconWhite}
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
        <div className="translate-text-button">
          <button onClick={handleSubmission}>Translate Text</button>
        </div>
      </div>

      {/* Error Highlighting Section */}

      <div className="error-highlighting-section">
        <hr className="divider" />
        <div className="source-text-highlighting">
          <h2 className="source-text-title">Original Text</h2>
          <p ref={sourceTextRef}>{sourceTextInput}</p>
        </div>

        <hr className="divider" />
        <h2 className="source-text-title">Translation Text</h2>

        <div
          className="highlight-container"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
          dangerouslySetInnerHTML={{ __html: enhancedHtmlString }}
          onClick={(e) => {
              const target = e.target as HTMLElement;
              const index = target.getAttribute('data-index');
              if (index) {
                handleSpanClick(parseInt(index, 10));
              }
            }}
        />

        <div className="error-tooltip-container" style={popupStyle}>
          <div className="error-tooltip">
            <h3>Error Type:</h3>
            <h3 style={{ color: "#00A0F0" }}> {error_type}</h3>
            <p>Additional Details... TBD</p>
          </div>
        </div>

        <hr className="divider" />
        <div className="error-legend-section">
          <ul>
            <div
              className="color-label"
              style={{ backgroundColor: "#113c6a" }}
            ></div>
            <p>Incomplete Subject</p>
            <div
              className="color-label"
              style={{ backgroundColor: "#2CF551" }}
            ></div>
            <p>Omission</p>
            <div
              className="color-label"
              style={{ backgroundColor: "#A5304C" }}
            ></div>
            <p>Incomplete Sentence</p>
          </ul>
        </div>
        <hr className="divider" />
        
        {/* slider Section */}
      <h2 className="source-text-title">Slider</h2>
      
      <div className="slide">
        Individual Span Scoring
        <input
          type="range"
          min="0"
          max="100"
          value={value1}
          onChange={handleChange1}
          className="slider"
        />
        <p>Value: {value1}</p>
        <hr className="divider" />
      </div>
      <div className="slide">
        Overall Sentence Scoring
        <input
          type="range"
          min="0"
          max="100"
          value={value2}
          onChange={handleChange2}
          className="slider"
        />
        <p>Value: {value2}</p>
        <hr className="divider" />
      </div>
      <div className="scores">
        <h2>Scores</h2>
        {Object.entries(spanScores).map(([index, score]) => (
          <p key={index}>
            Span {index}: {score}
          </p>
        ))}
        <p>Overall Sentence Score: {value2}</p>
      </div>
        <hr className="divider" />
      

	    
	     
      </div>
      
       

      {/* Edit Context Section */}

      <div className="edit-context-section">
        <h2 className="">Edit Context</h2>
        <div className="suggestion-section">
          This is a suggestion for “extra details”, provided by Option 2. The
          user can also choose Custom and enter their own text.
        </div>
        <hr className="divider" />
      </div>

      {/* Rephrase Section */}
      <div className="rephrase-section">
        <h2 className="">Rephrase</h2>
        <button>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit
          asperiores doloremque voluptatem voluptas blanditiis sequi, maxime ab
          ad minima quae!
        </button>
        <button>Lorem, ipsum dolor sit adipisicing elit. Ut, sit.</button>
        <button>Lorem, ipsum Ut, sit.</button>
        <hr className="divider" />
      </div>

      {/* Accept Translation Section */}
      <div className="accept-translation-section">
        <button>Accept Translation</button>
      </div>

      <div className="send-feedback">
        <a>Send Feedback</a>
      </div>
    </div>
  );
};

export default App;
