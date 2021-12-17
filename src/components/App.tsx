import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Router from "components/Router";
import { authService } from "../firebase";

function App() {
  const [ready, setReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    onAuthStateChanged(authService, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setReady(true);
    });
  }, []);

  if (ready === false) {
    return <span>Loading...</span>;
  }

  return (
    <>
      <Router isLoggedIn={Boolean(isLoggedIn)} />
      <footer>&copy; Twitter {new Date().getFullYear()}</footer>
    </>
  );
}

export default App;
