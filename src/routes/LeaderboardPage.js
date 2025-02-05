import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../styles/leaderboard.css";
import React, { useEffect, useState } from "react";

import { db } from "../firebase"; // Firebase Firestore configuration

import "../styles/home.css";
import {
  orderBy,
  onSnapshot,
  collection,
  query,
  where,
  count,
  getAggregateFromServer,
} from "firebase/firestore";
import { CalendarCheck, TrophyFill } from "react-bootstrap-icons";
import { useAppContext } from "../context/AppContext";
function LeaderboardPage() {
  const [posts, setPosts] = useState([]);
  const [ranking, setRanking] = useState([]);
  const navigate = useNavigate();
  const { allUsers } = useAppContext();
  console.log(allUsers["ZzVnVv9UQ7OL2AuemZ3ZbmqbsAE2"]);
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
    const fetchRankingData = async () => {
      const userPostCounts = {}; // Store user post counts

      const userIds = Object.keys(allUsers);

      // Fetch post count for each user
      for (const userId of userIds) {
        const postsQuery = query(
          collection(db, "posts"),
          where("userId", "==", userId)
        );
        const aggregateSnapshot = await getAggregateFromServer(postsQuery, {
          postCount: count(),
        });
        userPostCounts[userId] = aggregateSnapshot.data().postCount;
      }

      // Convert into ranking format and sort
      const rankingData = Object.entries(userPostCounts)
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count);

      // Assign positions
      let position = 1;
      let prevCount = null;
      let amountOfSame = 0;

      const rankingWithPositions = rankingData.map((item, index) => {
        if (item.count !== prevCount) {
          position = index + 1 - amountOfSame;
        } else {
          amountOfSame++;
        }
        prevCount = item.count;
        return { ...item, position };
      });
      setRanking(rankingWithPositions);
    };

    fetchRankingData(); // Run the async function
  }, [allUsers]); // Re-run this whenever posts change

  console.log(ranking);
  return (
    <div className="container">
      <p className="leaderboardTitle">Current standings</p>
      {ranking.map((user, index) => {
        return (
          <div key={user.userId} className="leaderboard">
            <div>
              <p> {user.position}</p>
              <img
                src={allUsers[user.userId].photoURL}
                alt=""
                className="postUserPhoto"
              />
              <p> {allUsers[user.userId].username}</p>
              {user.position === 1 && <TrophyFill color="#fdd813" />}
            </div>
            <div>
              {user.count}
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
