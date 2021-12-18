import { Link, useNavigate } from "react-router-dom";
import { authService } from "../firebase";

function Navigation() {
  const navigate = useNavigate();
  const onLogout = () => {
    const ok = window.confirm("Are you sure to logout?");
    if (ok) {
      authService.signOut();
      navigate("/", { replace: true });
    }
  };
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
        <li onClick={onLogout}>Logout</li>
      </ul>
    </nav>
  );
}

export default Navigation;
