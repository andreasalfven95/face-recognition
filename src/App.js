import React, { Component } from 'react';
import './App.css';
import Navigation from "./components/Navigation/Navigation";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Errors from "./components/Errors/Errors";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import SignIn from "./components/SignIn/SignIn";
import Register from "./components/Register/Register";
import Rank from "./components/Rank/Rank";
import Particles from 'react-particles-js';



const particlesOptions = {
  particles: {
    number: {
      value: 60,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: "",
  imgUrl: "",
  box: {},
  route: "signin",
  isSignedIn: false,
  isThereError: false,
  errorMessage: "",
  user: {
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: ""
  }
}

let isThereFace = null;
/* let errorMessageDisplay = ""; */

/* window.onerror = function errorHandler(err, url, line) {
  console.log("Here are the errors" + err + url + line)

  return false;
} */

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  }


  calculateFaceLocation = (data) => {
    /* let clarifaiFaces = [];
    for (let i = 0; i < data.outputs.length; i++) {
      clarifaiFaces = (data.outputs[i].data.regions[0].region_info.bounding_box);
    }
    console.log("faces", clarifaiFaces); */

    const clarifaiFace = (data.outputs[0].data.regions[0].region_info.bounding_box);
    isThereFace = clarifaiFace;
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height),
    }
  }

  displayFaceBox = (box) => {
    this.setState({ box: box })
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }

  onButtonSubmit = () => {
    this.setState({ isThereError: false });
    this.setState({ imgUrl: this.state.input });
    fetch("https://guarded-scrubland-64554.herokuapp.com/imageurl", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: this.state.input
      })
    })
      .then(response => response.json())
      .then(response => {
        this.displayFaceBox(this.calculateFaceLocation(response));
        //Finns ansikte isThereFace !== null
        if (isThereFace !== null) {
          if (response) {
            fetch("https://guarded-scrubland-64554.herokuapp.com/image", {
              method: "put",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: this.state.user.id
              })
            })
              .then(response => response.json())
              .then(count => {
                this.setState(Object.assign(this.state.user, { entries: count }))
              })
              .catch(err => {
                console.log(err);
                /* errorMessageDisplay = err;
                this.setState({ errorMessage: err }); */
                this.setState({ isThereError: true });
              })
          }
        }
        isThereFace = null;
        /* this.setState({ errorMessage: "" }); */
      })
      .catch(err => {
        console.log(err);
        this.setState({ errorMessage: "Unfortunately, that link didn't seem to work. Please try again!" });
        console.log(this.state.errorMessage);
        this.setState({ isThereError: true });
      })
  }

  onRouteChange = (route) => {
    this.setState({ isThereError: false });
    if (route === "signout") {
      this.setState(initialState)
    } else if (route === "home") {
      this.setState({ isSignedIn: true })
    }
    this.setState({ route: route });
  }


  render() {
    const { isSignedIn, imgUrl, box, route, isThereError, errorMessage } = this.state;
    return (
      <div className="App">
        <Particles className="particles"
          params={particlesOptions}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === "home"
          ? <>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries} />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit} />
            <FaceRecognition box={box} imgUrl={imgUrl} />
          </>
          : (
            route === "register"
              ? <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              : <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          )
        }
        {/* Working on displaying error messages for each problem. Ex. "Wrong cridentials", "Couldn't read picture" etc. */}
        { isThereError === true
          ? <Errors isThereError={isThereError} errorMessage={errorMessage} />
          : <> </>
        }
      </div>
    );
  }
}


export default App;
