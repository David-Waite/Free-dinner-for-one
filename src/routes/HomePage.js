import React, { useEffect, useRef, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase"; // Firebase Firestore configuration
import Postform from "../components/PostForm";
import Post from "../components/Post";

import "../styles/home.css";
import NavBar from "../components/NavBar";
import { useAppContext } from "../context/AppContext";
function HomePage() {
  const [error, setError] = useState("");
  const [posts, setPosts] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const { userData } = useAppContext();
  const dialogRef = useRef();

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

  useEffect(() => {
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
      {error && <p>{error}</p>}
      {userData && (
        <>
          <NavBar openPost={() => dialogRef.current?.showModal()} />
          <dialog className="dialog" ref={dialogRef}>
            <Postform
              userData={userData}
              toggleCreatePost={toggleCreatePost}
              fetchPosts={fetchPosts}
              closeModal={() => dialogRef.current?.close()}
            />
          </dialog>

          {posts.map((post) => (
            <Post key={post.id} postData={post} />
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
