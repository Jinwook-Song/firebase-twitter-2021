import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { dbService } from "../firebase";
import { ITweetObj, TweetInputs } from "routes/home";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface ITweetProps extends ITweetObj {
  loggedInUserId: string;
}

function Tweet({
  tweet,
  id: docId,
  creatorId,
  loggedInUserId,
}: Partial<ITweetProps>) {
  const [editTweet, setEditTweet] = useState(false);
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<Pick<TweetInputs, "tweet">>({
    mode: "onChange",
    defaultValues: {
      tweet,
    },
  });
  const tweetRef = doc(dbService, "tweets", `${docId}`);
  const onDeleteClick = async () => {
    const ok = window.confirm("Delete Tweet?");
    if (ok) {
      // delete tweet
      await deleteDoc(doc(dbService, "tweets", `${docId}`));
    }
  };
  const onEditToggle = () => {
    setEditTweet((prev) => !prev);
  };
  const onEditSubmit = async () => {
    const { tweet: newTweet } = getValues();
    // update tweet
    await updateDoc(tweetRef, {
      tweet: newTweet,
    });
    setEditTweet(false);
    reset();
  };

  if (editTweet) {
    return (
      <div>
        <form onSubmit={handleSubmit(onEditSubmit)}>
          <input
            {...register("tweet", {
              required: true,
            })}
            type="text"
            placeholder="What's happening?"
            className="input"
          />
          {errors.tweet?.message && <div>{errors.tweet.message}</div>}{" "}
          <button disabled={isValid ? false : true}>Update</button>
        </form>
        <button onClick={onEditToggle}>Cancle</button>
      </div>
    );
  }

  return (
    <div>
      <h4>{tweet}</h4>
      {creatorId === loggedInUserId && (
        <>
          <button onClick={onDeleteClick}>Delete</button>
          <button onClick={onEditToggle}>Edit</button>
        </>
      )}
    </div>
  );
}

export default Tweet;
