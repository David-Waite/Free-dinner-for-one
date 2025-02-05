import React, { useState, useEffect, useRef } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { Heart, HeartFill, Chat } from "react-bootstrap-icons";
import "../styles/posts.css";
import ReactPopUp from "./ReactPopup";
import EmojiPicker from "emoji-picker-react";
import { getAuth } from "firebase/auth";
import { useAppContext } from "../context/AppContext";
const db = getFirestore();
const Post = ({ postData }) => {
  const [reactions, setReactions] = useState([]);

  const [showDimmer, setShowDimmer] = useState(false);
  const [dimmerOpenAnimation, setDimmerOpenAnimation] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerOpenAnimation, setEmojiPickerOpenAnimation] =
    useState(false);
  const [showReactPopUp, setShowReactPopUp] = useState(false);
  const [reactPopUpOpenAnimation, setReactPopUpOpenAnimation] = useState(true);
  const [pageHeight, setPageHeight] = useState(0);

  const { allUsers, userData } = useAppContext();

  useEffect(() => {
    setReactions(postData.reacts);
  }, [postData.reacts]);

  async function selectEmoji(data) {
    const selectedEmoji = data?.emoji ? data.emoji : data;
    const postRef = doc(db, "posts", postData.id);

    try {
      const postSnap = await getDoc(postRef);
      if (!postSnap.exists()) {
        console.log("Post not found");
        return;
      }

      const currentPostData = postSnap.data();
      const currentReacts = currentPostData.reacts || [];

      // Remove existing reaction from the same user
      const filteredReacts = currentReacts.filter(
        (react) => react.userId !== userData.userId
      );

      // Add new reaction (without animation flag for Firestore)
      const newReaction = {
        userId: userData.userId,
        emoji: selectedEmoji,
      };
      const updatedReacts = [...filteredReacts, newReaction];

      // Update Firestore
      await updateDoc(postRef, { reacts: updatedReacts });

      // Update local state with animation (local-only flag)
      setReactions([
        ...updatedReacts.map((react) => ({
          ...react,
          animation: react.userId === userData.userId, // Add animation only to the user's new reaction
        })),
      ]);

      // Remove animation after 1 second
      setTimeout(() => {
        setReactions((prevReactions) =>
          prevReactions.map((reaction) => ({
            ...reaction,
            animation: false, // Remove animation flag locally
          }))
        );
      }, 1000);

      console.log("Reaction updated successfully!");
    } catch (error) {
      console.error("Error updating reaction:", error);
    }

    closeDimmer();
  }

  useEffect(() => {
    if (showDimmer) {
      document.body.style.overflow = "hidden"; // Disable scroll
    } else {
      document.body.style.overflow = "auto"; // Disable scroll
    }
  }, [showDimmer]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);

    return new Intl.DateTimeFormat("en-AU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Australia/Sydney",
    }).format(date);
  };

  function openReactPopUp() {
    setReactPopUpOpenAnimation(true);
    setShowReactPopUp(true);
    openDimmer();
  }
  const closeReactPopUp = () => {
    setReactPopUpOpenAnimation(false);

    setTimeout(() => {
      setShowReactPopUp(false);
    }, 300);
  };

  function openEmojiPicker() {
    closeReactPopUp();
    setShowEmojiPicker(true);
    setEmojiPickerOpenAnimation(true);
  }
  function closeEmojiPicker() {
    setEmojiPickerOpenAnimation(false);

    setTimeout(() => {
      setShowEmojiPicker(false);
    }, 300);
  }

  function openDimmer() {
    setPageHeight(() => {
      const body = document.body;
      const html = document.documentElement;

      // Calculate the total height by considering the maximum of various properties
      const totalHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );

      return totalHeight;
    });
    setShowDimmer(true);
    setDimmerOpenAnimation(true);
  }
  function closeDimmer() {
    if (showEmojiPicker) {
      closeEmojiPicker();
    }
    if (showReactPopUp) {
      closeReactPopUp();
    }
    setDimmerOpenAnimation(false); // Triggers fade-out effect

    setTimeout(() => {
      setShowDimmer(false);
    }, 300);
  }

  return (
    <div className="postcontainer">
      {showDimmer && (
        <div
          onClick={closeDimmer}
          style={{ height: pageHeight }}
          className={`postBlurBackground ${
            dimmerOpenAnimation
              ? "postBlurBackgroundOpen"
              : "postBlurBackgroundOpenClose"
          }`}
        ></div>
      )}
      {showEmojiPicker && (
        <div
          className={`emojiPicker ${
            emojiPickerOpenAnimation ? "emojiPickerOpen" : "emojiPickerClose"
          }`}
        >
          <EmojiPicker
            searchDisabled={true}
            open={true}
            style={{ width: "100%", maxWidth: "450px" }}
            previewConfig={{ showPreview: false }}
            onEmojiClick={selectEmoji}
          />
        </div>
      )}

      {/* User Profile and Post Header */}
      <div className="postHeader">
        <img
          src={allUsers[postData.userId].photoURL}
          alt=""
          className="postUserPhoto"
        />
        <div className="postHeaderLeft">
          <h3 className="postHeaderUsername">{postData.username}</h3>
          <p className="postHeaderDate">{formatDate(postData.timestamp)}</p>
        </div>
      </div>
      {/* Post Content */}
      <p className="postMessage">{postData.message}</p>
      {/* Post Image */}
      {postData.imageUrl && (
        <img src={postData.imageUrl} alt="Post" className="postImage" />
      )}

      {showReactPopUp && (
        <div className="postReactPopUpContainer">
          <ReactPopUp
            openEmojiPicker={openEmojiPicker}
            handleQuickSelect={selectEmoji}
            reactPopUpOpenAnimation={reactPopUpOpenAnimation}
          />
        </div>
      )}

      <div className="postFooter">
        <div className="postLikeNav">
          <div className="postLikeButtonsContainer">
            {reactions.some(
              (reaction) => reaction.userId === userData.userId
            ) ? (
              <HeartFill color="red" size={20} onClick={openReactPopUp} />
            ) : (
              <Heart size={20} onClick={openReactPopUp} />
            )}

            {/* <Chat className="postChatBtn" size={20} /> */}
          </div>
          {/* <p>2 Comments</p> */}
        </div>
        <div className="postUsersReacts">
          {reactions.map((react, index) => (
            <div
              key={index}
              className={`postUserReactContainer ${
                react.animation ? "newReactAnimation" : ""
              }`}
            >
              <img
                src={allUsers[react.userId].photoURL || "/default-profile.png"}
                alt=""
                className="postUserReactPhoto"
              />
              <span className="postUserReact">{react.emoji}</span>
            </div>
          ))}
        </div>
        {/* <div className="topComment">
          <p>
            <strong>Luke</strong> The HTML element defines text with strong
            importance. The content inside is typically displayed in bold.
            Example. This text is important! The HTML element defines text with
            strong importance. The content inside is typically displayed in
            bold. Example. This text is important!
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default Post;
