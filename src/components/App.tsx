import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { authService } from "../firebase";
import Router from "components/Router";
import Footer from "components/Footer";

export interface UserInfo {
  uid: string;
}

function App() {
  const [ready, setReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<UserInfo>({ uid: "" });
  useEffect(() => {
    onAuthStateChanged(authService, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setLoggedInUser(user);
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
      <Router //
        isLoggedIn={Boolean(isLoggedIn)}
        uid={loggedInUser.uid}
      />
      <Footer />
    </>
  );
}

export default App;
