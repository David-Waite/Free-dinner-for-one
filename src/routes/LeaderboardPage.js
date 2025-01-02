import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../styles/leaderboard.css";
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
function LeaderboardPage() {
  const postCollection = collection(db, "posts");
  const [posts, setPosts] = useState([]);
  const [ranking, setRanking] = useState([]);
  const navigate = useNavigate();
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
    if (posts.length > 0) {
      setRanking(() => {
        return Object.entries(
          posts.reduce((acc, post) => {
            acc[post.username] = (acc[post.username] || 0) + 1;
            return acc;
          }, {})
        )
          .map(([username, count]) => ({ username, count }))
          .sort((a, b) => b.count - a.count);
      });
    }
  }, [posts]);
  console.log(ranking);
  return (
    <div className="container">
      Leaderboard test
      {ranking.map((person) => {
        return (
          <div>
            {person.username} {person.count}
          </div>
        );
      })}
      <NavBar openPost={() => navigate("/")} />
    </div>
  );
}

export default LeaderboardPage;
