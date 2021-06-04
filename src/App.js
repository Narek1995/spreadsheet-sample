import './App.css';
import {useAuth0} from "@auth0/auth0-react";
import {Button} from "@material-ui/core";
import {useCallback, useEffect, useState} from "react";
import {BrowserRouter as Router, Route, Link, Switch} from 'react-router-dom'
import {Spreadsheet} from "./pages/Spreadsheet";
import {Spreadsheets} from "./pages/Spreadsheets";

function App() {

    const { loginWithRedirect, isAuthenticated } = useAuth0();



  return (
      <Router>
        <div className="App">
          <header className="App-header">
            Spreadsheet Application

                  <Login/>

          </header>
          <div style={{overflow: "scroll"}} id="spreadsheet">
              <Switch>
                  <Route path="/spreadsheet/:id">
                      <Spreadsheet/>
                  </Route>
                  <Route path="/">
                      <Spreadsheets/>
                  </Route>
              </Switch>
          </div>
        </div>
      </Router>
  );
}

const Login=() =>{
    const { loginWithRedirect, isAuthenticated, logout } = useAuth0();

    const loginCallback = useCallback(()=>{
        return isAuthenticated ? logout({ returnTo: window.location.origin }) : loginWithRedirect()
    },[loginWithRedirect, isAuthenticated, logout])

   return <Button variant="contained" color="primary" size='small' onClick={loginCallback}>
       {isAuthenticated ? "Log Out" : "Log In"}
    </Button>

}

export default App;
