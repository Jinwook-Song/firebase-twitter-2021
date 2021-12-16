import { useState } from "react";
import { authService } from "../firebase";
import Router from "components/Router";

function App() {
  console.log(authService.currentUser);
  const currentUser = authService.currentUser;
  const [isLoggedIn, setIsLoggedIn] = useState(currentUser);

  return (
    <>
      <Router isLoggedIn={Boolean(isLoggedIn)} />
      <footer>&copy; Twitter {new Date().getFullYear()}</footer>
    </>
  );
}

export default App;
