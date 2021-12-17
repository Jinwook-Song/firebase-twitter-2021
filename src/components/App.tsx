import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { authService } from "../firebase";
import Router from "components/Router";
import Footer from "components/Footer";

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
      <Footer />
    </>
  );
}

export default App;
