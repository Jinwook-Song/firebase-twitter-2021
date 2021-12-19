import { updateProfile } from "firebase/auth";
import { authService } from "../firebase";
import { collection, query, orderBy, where, getDocs } from "firebase/firestore";
import { dbService } from "../firebase";
import { UserInfo } from "components/App";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ITweetData, ITweetObj } from "./home";
import Tweet from "components/Tweet";

interface IUserProps {
  providerId: string | null;
  uid: string | null;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
}

function Profile({ uid, displayName }: Partial<UserInfo>) {
  const user = authService.currentUser;
  const [myTweets, setMyTweets] = useState<ITweetObj[]>([]);
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<Partial<IUserProps>>({
    mode: "onChange",
    defaultValues: {
      displayName,
    },
  });
  const onDisplayNameSubmit = () => {
    const { displayName } = getValues();
    if (displayName !== user?.displayName) {
      updateProfile(user!, {
        displayName,
      })
        .then(() => {
          // Profile updated!
          // ...
        })
        .catch((error) => {
          // An error occurred
          // ...
        });
      window.location.reload();
    }
    reset();
  };
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // console.log(myTweets);
  return (
    <div>
      <form onSubmit={handleSubmit(onDisplayNameSubmit)}>
        <input
          {...register("displayName", {
            required: true,
          })}
          type="text"
          placeholder="Username"
          className="input"
        />
        {errors.displayName?.message && <div>{errors.displayName.message}</div>}
        <button disabled={isValid ? false : true}>Update Username</button>
      </form>
      <div>
        {myTweets.map(({ tweet, id: docId, creatorId, imageUrl }) => (
          <Tweet
            key={docId}
            id={docId}
            tweet={tweet}
            creatorId={creatorId}
            loggedInUserId={""}
            imageUrl={imageUrl}
          />
        ))}
      </div>
    </div>
  );
}

export default Profile;
