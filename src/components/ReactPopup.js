import React from "react";

import { PlusCircleFill } from "react-bootstrap-icons";
import "../styles/reactPopUp.css";

const ReactPopUp = ({
  openEmojiPicker,
  handleQuickSelect,
  reactPopUpOpenAnimation,
}) => {
  return (
    <div
      className={`reactPopUpContainer ${
        reactPopUpOpenAnimation
          ? "reactPopUpContainerOpen"
          : "reactPopUpContainerClosed"
      }`}
    >
      <button onClick={() => handleQuickSelect("❤️")}>❤️</button>
      <button onClick={() => handleQuickSelect("👍")}>👍</button>
      <button onClick={() => handleQuickSelect("💪")}>💪</button>
      <button onClick={() => handleQuickSelect("🔥❤️")}>🔥</button>
      <button onClick={() => handleQuickSelect("😰")}>😰</button>
      <button onClick={() => handleQuickSelect("😊")}>😊</button>
      <button>
        <PlusCircleFill onClick={openEmojiPicker} fontSize={30} color="white" />
      </button>
    </div>
  );
};

export default ReactPopUp;
