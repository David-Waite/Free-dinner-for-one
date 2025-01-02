import "../styles/NavBar.css";
import { TrophyFill, CameraFill, GraphUpArrow } from "react-bootstrap-icons";

const NavBar = ({ openPost }) => {
  return (
    <div className="NavBarContainer">
      <GraphUpArrow className="NavIcon" />

      <CameraFill className="NavIcon" onClick={openPost} />

      <TrophyFill className="NavIcon" />
    </div>
  );
};

export default NavBar;
