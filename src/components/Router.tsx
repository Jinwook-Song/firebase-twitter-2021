import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "components/Navigation";
import Auth from "routes/auth";
import Home from "routes/home";
import Profile from "routes/profile";

interface IRouterProps {
  isLoggedIn: boolean;
}

function Router({ isLoggedIn }: IRouterProps) {
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
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
