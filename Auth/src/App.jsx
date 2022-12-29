import './App.css';
import axios from 'axios';
import Login from "./components/Login/login";
import Signup from "./components/Signup/signup";
import Profile from './components/Profile/profile'
import Home from "./components/home";
import Gallery from "./components/gallery";
import About from "./components/about";
import { useEffect, useState, useContext } from "react";
import { GlobalContext } from './components/context/Context';
import { Routes, Route, Link, Navigate } from "react-router-dom";


function App() {
  const baseUrl = 'http://localhost:6001/api/v1'

  let { state, dispatch } = useContext(GlobalContext);
  const [fullName, setFullName] = useState("");

  const logoutHandler = async() => {

    try {
      let response = await axios.post(`${baseUrl}/logout`, {
        withCredentials: true
      })
      console.log('response:', response)
      dispatch({
        type: 'USER_LOGOUT'
      })
    } catch (error) {
      console.log('axios error:', error)
         }


  }

  useEffect(() => {
    const getProfile = async () => {
      try {
        let response = await axios.get(`${baseUrl}/profile`, {
          withCredentials: true
        })
        console.log('response:', response)
        dispatch({
          type: 'USER_LOGIN'
        })
      } catch (error) {
        console.log('axios error:', error)
        dispatch({
          type: 'USER_LOGOUT'
        })
      }

    }
    getProfile();
  }, [])

  return (
    <div>
{/* <Profile/> */}

      {
        (state.isLogin === true) ?
          <ul className='navBar'>
            <li> <Link to={`/`}>Home</Link> </li>
            <li> <Link to={`/gallery`}>Gallery</Link> </li>
            <li> <Link to={`/about`}>About</Link> </li>
            <li> <Link to={`/profile`}>Profile</Link> </li>
            <li> {fullName} <button onClick={logoutHandler}>Logout</button> </li>
          </ul>
          :
          null
      }
      {
        (state.isLogin === false) ?
          <ul className='navBar'>
            <li> <Link to={`/`}>Login</Link> </li>
            <li> <Link to={`/signup`}>Signup</Link> </li>
          </ul>
          : null
      }

      {(state.isLogin === true) ?

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
        : null}

      {
        (state.isLogin === false) ?
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/" replace={true} />} />
          </Routes>
          : null}

      {(state.isLogin === null) ?

        <img src='images/Loading_icon.gif' className='Loading_icon' alt='' />

        : null
      }

    </div>
  );
}

export default App;

