import { UserInfo } from "components/App";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { dbService } from "../firebase";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Tweet from "components/Tweet";

export interface TweetInputs {
  tweet: string;
  creatorId: UserInfo;
}

interface ITweetData extends TweetInputs {
  createdAt: number;
}

export interface ITweetObj extends ITweetData {
  id: string;
}

function Home({ uid }: UserInfo) {
  const [tweets, setTweets] = useState<ITweetObj[]>([]);

  useEffect(() => {
    onSnapshot(
      query(collection(dbService, "tweets"), orderBy("createdAt", "desc")),
      (snapshot) => {
        const tweetArray: ITweetObj[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as ITweetData),
        }));
        setTweets(tweetArray);
      }
    );
  }, []);

  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<TweetInputs>({
    mode: "onChange",
  });
  const onSubmit = async () => {
    const { tweet } = getValues();
    try {
      const docRef = await addDoc(collection(dbService, "tweets"), {
        tweet,
        creatorId: uid,
        createdAt: Date.now(),
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      reset();
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("tweet", {
            required: true,
          })}
          type="text"
          placeholder="What's happening?"
          className="input"
        />
        {errors.tweet?.message && <div>{errors.tweet.message}</div>}
        <button disabled={isValid ? false : true}>Tweet</button>
      </form>
      <div>
        {tweets.map(({ tweet, id: docId, creatorId }) => (
          <Tweet
            key={docId}
            id={docId}
            tweet={tweet}
            creatorId={creatorId}
            loggedInUserId={uid}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;
