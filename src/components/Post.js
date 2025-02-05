import React, { useState, useEffect, useRef } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { Heart, Chat } from "react-bootstrap-icons";
import "../styles/posts.css";
import ReactPopUp from "./ReactPopup";
import EmojiPicker from "emoji-picker-react";
import { getAuth } from "firebase/auth";
const db = getFirestore();
const Post = ({ message, timestamp, imageURL, userId, postId, reacts }) => {
  const [userPhoto, setUserPhoto] = useState("");
  const [username, setUsername] = useState("");

  const [showDimmer, setShowDimmer] = useState(false);
  const [dimmerOpenAnimation, setDimmerOpenAnimation] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerOpenAnimation, setEmojiPickerOpenAnimation] =
    useState(false);

  const [showReactPopUp, setShowReactPopUp] = useState(false);
  const [reactPopUpOpenAnimation, setReactPopUpOpenAnimation] = useState(true);
  const [pageHeight, setPageHeight] = useState(0);
  const [reactionsWithPhotos, setReactionsWithPhotos] = useState([]);
  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        setUserPhoto(userDoc.data().photoURL || "default-profile-pic-url");
        setUsername(userDoc.data().username);
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    async function fetchUserPhotos() {
      const updatedReacts = await Promise.all(
        reacts.map(async (react) => {
          const userRef = doc(db, "users", react.userId);
          const userSnap = await getDoc(userRef);
          const photoURL = userSnap.exists() ? userSnap.data().photoURL : null;
          return { ...react, photoURL };
        })
      );
      setReactionsWithPhotos(updatedReacts);
    }

    if (reacts.length > 0) {
      fetchUserPhotos();
    }
  }, [reacts]);
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
  console.log(reacts);
  async function selectEmoji(data) {
    const auth = getAuth();
    const userId = auth.currentUser?.uid; // Get the authenticated user ID
    const selectedEmoji = data?.emoji ? data.emoji : data;

    if (!userId) {
      console.log("User not authenticated");
      return;
    }

    const postRef = doc(db, "posts", postId);

    try {
      const postSnap = await getDoc(postRef);
      if (!postSnap.exists()) {
        console.log("Post not found");
        return;
      }

      const postData = postSnap.data();
      const currentReacts = postData.reacts || [];

      // Remove existing reaction from the same user
      const filteredReacts = currentReacts.filter(
        (react) => react.userId !== userId
      );

      // Add new reaction
      const newReaction = { userId, emoji: selectedEmoji };
      filteredReacts.push(newReaction);

      // Update Firestore
      await updateDoc(postRef, { reacts: filteredReacts });

      // 🔹 Update local state immediately
      setReactionsWithPhotos((prevReactions) => {
        const filteredLocalReacts = prevReactions.filter(
          (react) => react.userId !== userId
        );
        return [
          ...filteredLocalReacts,
          { ...newReaction, photoURL: userPhoto },
        ];
      });

      console.log("Reaction updated successfully!");
    } catch (error) {
      console.error("Error updating reaction:", error);
    }

    closeDimmer();
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
        <img src={userPhoto} alt="Profile" className="postUserPhoto" />
        <div className="postHeaderLeft">
          <h3 className="postHeaderUsername">{username}</h3>
          <p className="postHeaderDate">{formatDate(timestamp)}</p>
        </div>
      </div>
      {/* Post Content */}
      <p className="postMessage">{message}</p>
      {/* Post Image */}
      {imageURL && (
        <img src={imageURL} alt="Post" width={300} className="postImage" />
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
            <Heart size={20} onClick={openReactPopUp} />
            {/* <Chat className="postChatBtn" size={20} /> */}
          </div>
          {/* <p>2 Comments</p> */}
        </div>
        <div className="postUsersReacts">
          {reactionsWithPhotos.map((react, index) => (
            <div key={index} className="postUserReactContainer">
              <img
                src={react.photoURL || "/default-profile.png"} // Fallback image
                alt="Profile"
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
