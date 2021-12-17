import { Link, useNavigate } from "react-router-dom";
import { authService } from "../firebase";

function Navigation() {
  const navigate = useNavigate();
  const onLogout = () => {
    authService.signOut();
    navigate("/", { replace: true });
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
        <li onClick={onLogout}>&larr;</li>
      </ul>
    </nav>
  );
}

export default Navigation;
