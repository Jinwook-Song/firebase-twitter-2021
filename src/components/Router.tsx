import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "../routes/auth";
import Home from "../routes/home";

function Router() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // User not Logged In Router
  if (isLoggedIn === false) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // User Logged In Router
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
