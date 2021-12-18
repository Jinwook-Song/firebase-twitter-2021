import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "components/Navigation";
import Auth from "routes/auth";
import Home from "routes/home";
import Profile from "routes/profile";
import { UserInfo } from "./App";

interface IRouterProps extends UserInfo {
  isLoggedIn: boolean;
}

function Router({ isLoggedIn, uid }: IRouterProps) {
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
      <Navigation />
      <Routes>
        <Route path="/" element={<Home uid={uid} />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
