import { createContext, useContext, useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Create Context
const AppContext = createContext();

// Create Provider
export const AppProvider = ({ children }) => {
  const [allUsers, setAllUsers] = useState({}); // Hash map { userId: { photoURL, username } }
  const [userData, setUserData] = useState();

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, "users");
      const usersSnap = await getDocs(usersRef);
      const usersData = {};

      usersSnap.forEach((doc) => {
        const userData = doc.data();
        usersData[doc.id] = {
          photoURL: userData.photoURL || "/default-profile.png",
          username: userData.username || "Unknown User",
          userId: doc.id || "Unknown User",
        };
      });

      setAllUsers(usersData);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;

      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            setUserData({ ...docSnap.data(), userId: user.uid });
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
    };

    fetchUserData();
  }, [auth]);

  return (
    <AppContext.Provider
      value={{
        allUsers,
        userData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom Hook to Use Context
export const useAppContext = () => useContext(AppContext);
