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
import { CalendarCheck, TrophyFill } from "react-bootstrap-icons";
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
    const fetchUserData = async (userId) => {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        return userDoc.data().photoURL || "default-profile-pic-url";
      }
      return "default-profile-pic-url"; // Return default photo if not found
    };

    const fetchRankingData = async () => {
      if (posts.length > 0) {
        const rankingData = Object.entries(
          posts.reduce((acc, post) => {
            acc[post.username] = acc[post.username] || {
              count: 0,
              userId: post.userId,
            };
            acc[post.username].count += 1;
            return acc;
          }, {})
        )
          .map(([username, { count, userId }]) => ({ username, count, userId }))
          .sort((a, b) => b.count - a.count);

        let position = 1; // Start ranking at position 1
        let prevCount = null;
        let amountOfSame = 0;

        // Fetch user photos for each user in the ranking data
        const rankingWithPhotos = await Promise.all(
          rankingData.map(async (item, index) => {
            const photoURL = await fetchUserData(item.userId); // Fetch the user's photo
            if (item.count !== prevCount) {
              position = index + 1 - amountOfSame; // Update position only when count changes
            } else {
              amountOfSame++;
            }
            prevCount = item.count;
            return { ...item, position, photoURL }; // Add position and photoURL to the object
          })
        );

        setRanking(rankingWithPhotos);
      }
    };

    fetchRankingData(); // Run the async function
  }, [posts]); // Re-run this whenever posts change

  console.log(ranking);
  return (
    <div className="container">
      <p className="leaderboardTitle">Current standings</p>
      {ranking.map((person, index) => {
        return (
          <div key={person.username} className="leaderboard">
            <div>
              <p> {person.position}</p>
              <img
                src={person.photoURL}
                alt="Profile"
                className="postUserPhoto"
              />
              <p> {person.username}</p>
              {person.position === 1 && <TrophyFill color="#fdd813" />}
            </div>
            <div>
              {person.count}
              <CalendarCheck />
            </div>
          </div>
        );
      })}
      <NavBar openPost={() => navigate("/")} />
    </div>
  );
}

export default LeaderboardPage;
