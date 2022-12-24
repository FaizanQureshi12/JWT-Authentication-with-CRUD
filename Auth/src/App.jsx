import './App.css';
import Login from "./components/Login/login";
import Signup from "./components/Signup/signup";
import Home from "./components/home";
import Gallery from "./components/gallery";
import About from "./components/about";
import { useEffect, useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";


function App() {

  const [isLogin, setIsLogin] = useState(false);
  const [fullName, setFullName] = useState("");

  const logoutHandler = () => {


  }

  return (
    <div>
      {/* <Login/>         
<Signup/>
<Gallery/>
<Home/>
<About/> */}

      {
        (isLogin) ?
          <ul className='navBar'>
            <li> <Link to={`/`}>Home</Link> </li>
            <li> <Link to={`/gallery`}>Gallery</Link> </li>
            <li> <Link to={`/about`}>About</Link> </li>
            <li> <Link to={`/profile`}>Profile</Link> </li>
            <li> {fullName} <button onClick={logoutHandler}>Logout</button> </li>
          </ul>
          :
          <ul className='navBar'>
            <li> <Link to={`/`}>Login</Link> </li>
            <li> <Link to={`/signup`}>Signup</Link> </li>
          </ul>
      }

      {(isLogin) ?

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
        :
        <Routes>
          {/* ////set={setIsLogin} */}
          <Route path="/" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
      }

    </div>
  );
}

export default App;

