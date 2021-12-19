import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { authService } from "../firebase";
import Router from "components/Router";
import Footer from "components/Footer";

export interface UserInfo {
  uid: string;
  displayName: string | null;
}

function App() {
  const [ready, setReady] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<UserInfo>({
    uid: "",
    displayName: null,
  });
  useEffect(() => {
    onAuthStateChanged(authService, (user) => {
      if (user) {
        console.log(user);
        setLoggedInUser(user);
      } else {
        setLoggedInUser({ uid: "", displayName: null });
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
        uid={loggedInUser.uid}
        displayName={loggedInUser.displayName}
      />
      <Footer />
    </>
  );
}

export default App;
