import { useLocation, useNavigate } from "react-router-dom";
import "../styles/postComments.css";
import { ArrowLeftShort, Heart, SendFill } from "react-bootstrap-icons";
import Post from "../components/Post";
import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
const PostCommentPage = () => {
  const [newComment, setNewComment] = useState();
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, allUsers } = useAppContext();
  const [currentComments, setCurrentComments] = useState([]);
  const firstCommentRef = useRef(null);
  const lastCommentRef = useRef(null);
  useEffect(() => {
    if (post) setCurrentComments(post.comments);
  }, []);
  useEffect(() => {
    if (firstCommentRef.current) {
      firstCommentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentComments]);

  useEffect(() => {
    if (lastCommentRef.current) {
      lastCommentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentComments]);
  const post = location.state?.postData; // Retrieve the passed post data

  if (!post) {
    return <p>Post not found!</p>; // Handle case where no data is passed
  }

  async function handleSubmitComment(event) {
    event.preventDefault();
    if (!newComment.trim()) return; // Prevent empty comments

    try {
      const postRef = doc(db, "posts", post.id); // Reference to the specific post

      // Create the new comment object
      const newCommentObj = {
        userId: userData.userId,
        username: userData.username,
        comment: newComment.trim(),
        likes: [], // Empty likes array initially
        timestamp: new Date(), // Store timestamp for sorting
      };

      // Update Firestore: Add new comment to the post's comments array
      await updateDoc(postRef, {
        comments: arrayUnion(newCommentObj),
      });

      console.log("Comment added successfully");
      setCurrentComments((prev) =>
        prev ? [...prev, newCommentObj] : [newCommentObj]
      );

      // Clear input field after submission
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  }

  return (
    <div className="CommentPageContainer">
      <div className="commentsNav">
        <div className="commentNavInnerContainer">
          <ArrowLeftShort
            className="commentsBackArrow cursor"
            size={32}
            onClick={() => navigate("/")}
          />
          <h1>{post.username}'s post</h1>
        </div>
      </div>
      <Post postData={post} commentsPage={true} />
      <div className="commentsContainer" ref={firstCommentRef}>
        {currentComments?.length > 0 &&
          currentComments?.map((comment, index) => {
            return (
              <div
                key={index}
                className="individualCommentContainer"
                ref={
                  index === currentComments.length - 1 ? lastCommentRef : null
                }
                style={{
                  marginBottom:
                    index === currentComments.length - 1 && index !== 0
                      ? "24px"
                      : index === currentComments.length - 1 && index === 0
                      ? "24px"
                      : "0px",
                }}
              >
                <img
                  className="postUserPhoto"
                  src={allUsers[comment.userId].photoURL}
                  alt=""
                />
                <div className="commentContextContainer">
                  <div className="commentContext">
                    <h2>{comment.username}</h2>
                    <p>{comment.comment}</p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      <div className="commentInputContainer">
        <div className="commentInputContainerInner">
          <form onSubmit={handleSubmitComment}>
            <input
              type="text"
              placeholder="Write a comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button className="sendArrow" onClick={handleSubmitComment}>
              <SendFill size={20} fill="#ff3d00" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostCommentPage;
