import { collection, addDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { dbService } from "../firebase";

interface TweetInputs {
  tweet: string;
}

function Home() {
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
    </div>
  );
}

export default Home;
