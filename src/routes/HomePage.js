import React, { useEffect, useRef, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Firebase Firestore configuration
import Postform from "../components/PostForm";
import Post from "../components/Post";
import SetUp from "../components/SetUp";
import "../styles/home.css";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import NavBar from "../components/NavBar";
function HomePage() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

  const auth = getAuth();
  const [posts, setPosts] = useState([]);
  const [createPost, setCreatePost] = useState(false);

  const dialogRef = useRef();

  useEffect(() => {
    const fetchPosts = () => {
      const postCollection = collection(db, "posts");
      const postQuery = query(postCollection, orderBy("timestamp", "desc"));
      const unsubscribe = onSnapshot(postQuery, (snapshot) => {
        const postList = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setPosts(postList);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;

      if (user) {
        try {
          // Get the user document from Firestore
          const userDocRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setError("User data not found");
          }
        } catch (err) {
          setError("Failed to fetch user data");
        }
      } else {
        setError("No user signed in");
      }
    };

    fetchUserData();
  }, [auth]);
  function toggleCreatePost() {
    dialogRef.current?.showModal();
  }
  return (
    <div className="container">
      {createPost && <div className="dimmer"></div>}
      {error && <p>{error}</p>}
      {userData && (
        <>
          {/* <SetUp /> */}
          <NavBar openPost={() => dialogRef.current?.showModal()} />
          <dialog className="dialog" ref={dialogRef}>
            <Postform
              userData={userData}
              toggleCreatePost={toggleCreatePost}
              closeModal={() => dialogRef.current?.close()}
            />
          </dialog>

          {posts.map((post) => (
            <Post
              key={post.id}
              postId={post.id}
              message={post.message}
              timestamp={post.timestamp}
              imageURL={post.imageUrl}
              userId={post.userId}
            />
          ))}
        </>
      )}
    </div>
  );
}

export default HomePage;
