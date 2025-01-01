import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

const storage = getStorage();
const db = getFirestore();
const auth = getAuth();

const SetUp = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [photoURL, setPhotoURL] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Upload file to Firebase Storage and update Firestore
  const handleUpload = async () => {
    if (!file) return;

    const user = auth.currentUser;
    if (!user) {
      console.error("No user is logged in");
      return;
    }

    setUploading(true);
    const storageRef = ref(storage, `profile_photos/${user.uid}`);

    try {
      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the file URL
      const photoURL = await getDownloadURL(storageRef);

      // Update the user's document in Firestore with the new photo URL
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { photoURL });

      // Set the URL in state to display it
      setPhotoURL(photoURL);
      alert("Profile photo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading profile photo: ", error);
      alert("Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Upload Profile Photo</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Photo"}
      </button>
    </div>
  );
};

export default SetUp;
