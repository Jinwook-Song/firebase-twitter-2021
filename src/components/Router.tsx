import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "routes/auth";
import Home from "routes/home";

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
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
