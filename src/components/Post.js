import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import "../styles/posts.css";
const db = getFirestore();

const Post = ({ message, timestamp, imageURL, userId }) => {
  const [userPhoto, setUserPhoto] = useState("");
  const [username, setUsername] = useState("");

  // Fetch user's profile picture and check if the user has already liked the post
  useEffect(() => {
    const fetchUserData = async () => {
      // Fetch user's profile photo
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        setUserPhoto(userDoc.data().photoURL || "default-profile-pic-url");
        setUsername(userDoc.data().username);
      }
      // Check if the current user has liked the post
    };

    fetchUserData();
  }, [userId]);

  // Handle like action
  const formatDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // 12-hour format
    }).format(date);
  };
  return (
    <div className="postcontainer">
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
    </div>
  );
};

export default Post;
