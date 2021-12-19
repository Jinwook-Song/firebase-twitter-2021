import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "components/Navigation";
import Auth from "routes/auth";
import Home from "routes/home";
import Profile from "routes/profile";
import { UserInfo } from "./App";

function Router({ uid, displayName }: UserInfo) {
  // User not Logged In Router
  if (!uid) {
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
      <Navigation uid={uid} displayName={displayName} />
      <Routes>
        <Route path="/" element={<Home uid={uid} />} />
        <Route
          path="/profile"
          element={<Profile uid={uid} displayName={displayName} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
