import { UserInfo } from "components/App";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { ref, uploadString } from "firebase/storage";
import { dbService, storageService } from "../firebase";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
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
  const [fileUrl, setFileUrl] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);

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
      // const tweetRef = await addDoc(collection(dbService, "tweets"), {
      //   tweet,
      //   creatorId: uid,
      //   createdAt: Date.now(),
      // });
      // console.log("Document written with ID: ", tweetRef.id);
      const storageRef = ref(storageService, `${uid}/${uuidv4()}`);
      if (fileUrl) {
        const response = await uploadString(storageRef, fileUrl, "data_url");
        console.log(response);
      }
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      reset();
    }
  };

  const onFileChange = ({
    currentTarget: { files },
  }: React.ChangeEvent<HTMLInputElement>) => {
    if (files) {
      // get the file
      const uploadFile = files[0];
      // create a reader
      const reader = new FileReader();
      // listening onload event
      reader.onload = (finishedRead) => {
        setFileUrl(finishedRead.target?.result as string);
      };
      // read using data url
      reader.readAsDataURL(uploadFile);
    }
  };

  const onClearFile = () => {
    setFileUrl("");
    if (fileRef.current) {
      fileRef.current.value = "";
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
        <input
          onChange={onFileChange}
          type="file"
          accept="image/*"
          ref={fileRef}
        />
        <button disabled={isValid ? false : true}>Tweet</button>
        {fileUrl && (
          <div>
            <img src={fileUrl} alt={"tweetImg"} width="50px" height="50px" />
            <button onClick={onClearFile}>Cancle</button>
          </div>
        )}
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
