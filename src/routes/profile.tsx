import { collection, query, orderBy, where, getDocs } from "firebase/firestore";
import { dbService } from "../firebase";
import { UserInfo } from "components/App";
import { useEffect, useState } from "react";
import { ITweetData, ITweetObj } from "./home";

function Profile({ uid }: Partial<UserInfo>) {
  const [myTweets, setMyTweets] = useState<ITweetObj[]>([]);

  const getMyTweets = async () => {
    const q = query(
      collection(dbService, "tweets"),
      where("creatorId", "==", uid),
      orderBy("createdAt", "asc")
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const tweetObject: ITweetObj = {
        ...(doc.data() as ITweetData),
        id: doc.id,
      };
      if (myTweets !== null) {
        setMyTweets((prev) => [tweetObject, ...prev]);
      }
    });
  };
  useEffect(() => {
    getMyTweets();
  }, []);

  console.log(myTweets);
  return <div>{uid}</div>;
}

export default Profile;
