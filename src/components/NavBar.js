import { useNavigate } from "react-router-dom";
import "../styles/NavBar.css";
import { TrophyFill, CameraFill, GraphUpArrow } from "react-bootstrap-icons";

const NavBar = ({ openPost }) => {
  const navigate = useNavigate();
  return (
    <div className="NavBarContainer">
      <GraphUpArrow className="NavIcon" />

      <CameraFill className="NavIcon" onClick={openPost} />

      <TrophyFill
        className="NavIcon"
        onClick={() => navigate("/leaderboard")}
      />
    </div>
  );
};

export default NavBar;
