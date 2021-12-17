import { collection, addDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { StringDecoder } from "string_decoder";
import { dbService } from "../firebase";

interface TweetInputs {
  tweet: string;
}

interface ITweetData extends TweetInputs {
  createdAt: number;
}

interface ITweetObj extends ITweetData {
  id: string;
}

function Home() {
  const [tweets, setTweets] = useState<ITweetObj[]>([]);

  const getTweets = async () => {
    const querySnapshot = await getDocs(collection(dbService, "tweets"));
    querySnapshot.forEach((doc) => {
      const data = doc.data() as ITweetData;
      const tweetObject: ITweetObj = {
        ...data,
        id: doc.id,
      };
      if (tweets !== null) {
        setTweets((prev) => [tweetObject, ...prev]);
      }
    });
  };

  useEffect(() => {
    getTweets();
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
        createdAt: Date.now(),
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      reset();
    }
  };

  console.log(tweets);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("tweet", {
            required: "true",
          })}
          type="text"
          placeholder="What's happening?"
          className="input"
        />
        {errors.tweet?.message && <div>{errors.tweet.message}</div>}
        <button disabled={isValid ? false : true}>Tweet</button>
      </form>
      <div>
        {tweets.map(({ tweet, id }) => (
          <div key={id}>
            <h4>{tweet}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
