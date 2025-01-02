import React, { useEffect, useRef, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase"; // Firebase Firestore configuration
import Postform from "../components/PostForm";
import Post from "../components/Post";
import SetUp from "../components/SetUp";
import "../styles/home.css";
import NavBar from "../components/NavBar";

function HomePage() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createPost, setCreatePost] = useState(false);

  const dialogRef = useRef();
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;

      if (user) {
        try {
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

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const postCollection = collection(db, "posts");
      const postQuery = query(
        postCollection,
        orderBy("timestamp", "desc"),
        limit(4)
      );

      const snapshot = await getDocs(postQuery);
      const postsList = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setPosts(postsList);

      // Save the last visible post for pagination
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const loadMorePosts = async () => {
    if (lastVisible) {
      setLoading(true);
      const postCollection = collection(db, "posts");
      const postQuery = query(
        postCollection,
        orderBy("timestamp", "desc"),
        startAfter(lastVisible),
        limit(4)
      );

      const snapshot = await getDocs(postQuery);
      const postsList = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setPosts((prevPosts) => [...prevPosts, ...postsList]);

      // Update the last visible post
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setLoading(false);
    }
  };

  function toggleCreatePost() {
    dialogRef.current?.showModal();
  }

  return (
    <div className="container">
      {createPost && <div className="dimmer"></div>}
      {error && <p>{error}</p>}
      {userData && (
        <>
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

          {/* Load More Button */}
          {lastVisible && !loading && (
            <button className="loadMoreBtn" onClick={loadMorePosts}>
              Load More
            </button>
          )}

          {loading && (
            <p style={{ textAlign: "center", marginBottom: "72px" }}>
              Loading...
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default HomePage;
