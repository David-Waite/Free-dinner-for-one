import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase"; // Firebase setup
import "../styles/postForm.css";
import { XCircle } from "react-bootstrap-icons";
function Postform({ userData, closeModal }) {
  const [message, setMessage] = useState(""); // Post message
  const [image, setImage] = useState(null); // Image file
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  console.log(userData);
  const auth = getAuth();
  const user = auth.currentUser; // Get current user

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!message || !image) {
      setUploadError("Please provide both a message and an image.");
      return;
    }

    setIsUploading(true);

    try {
      // Check the user's last post timestamp
      const userPostsRef = collection(db, "posts");
      const userPostsQuery = query(
        userPostsRef,
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(1)
      );
      const userPostsSnapshot = await getDocs(userPostsQuery);

      if (!userPostsSnapshot.empty) {
        const lastPost = userPostsSnapshot.docs[0].data();
        const lastPostDate = new Date(lastPost.timestamp.seconds * 1000);
        const currentDate = new Date();

        // Check if the last post was within the same calendar day
        if (lastPostDate.toDateString() === currentDate.toDateString()) {
          setUploadError("You can only post once per day.");
          setIsUploading(false);
          return;
        }
      }

      // Upload image to Firebase Storage
      const imageRef = ref(storage, `posts/${user.uid}/${image.name}`);
      const uploadTask = uploadBytesResumable(imageRef, image);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Progress tracking (optional)
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          setUploadError("Error uploading image: " + error.message);
          setIsUploading(false);
        },
        async () => {
          // Get image URL after upload
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

          // Add post data to Firestore
          try {
            await addDoc(collection(db, "posts"), {
              message: message,
              timestamp: new Date(),
              userId: user.uid,
              username: userData.username,
              imageUrl: imageUrl,
            });

            setMessage(""); // Reset message
            setImage(null); // Reset image
            setIsUploading(false); // End uploading state
          } catch (error) {
            setUploadError("Error posting: " + error.message);
            setIsUploading(false);
          }
        }
      );
    } catch (error) {
      setUploadError("Error checking post limit: " + error.message);
      setIsUploading(false);
    }
  };

  return (
    <div className="postFormContainer">
      <div className="postFormContainerHeader">
        <h1 className="createPostTitle">Create post</h1>
        <XCircle onClick={closeModal} className="postFormCloseBtn">
          X
        </XCircle>
        <div className="createPostLine"></div>
      </div>

      <div className="postHeader">
        <img src={userData.photoURL} alt="Profile" className="postUserPhoto" />
        <div className="postHeaderLeft">
          <h3 className="postHeaderUsername">{userData.username}</h3>
        </div>
      </div>
      <div className="createPostUploadFile">
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>
      <form onSubmit={handlePostSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a message..."
          className="createPostMessage"
          rows="4"
          cols="50"
        />

        <button
          className="createPostPostBtn"
          type="submit"
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Post"}
        </button>
        {uploadError && <p style={{ color: "red" }}>{uploadError}</p>}
      </form>
    </div>
  );
}

export default Postform;
