# 트위터 with Firebase

## Note

- [Notion](https://rustic-need-f90.notion.site/with-Firebase-b5fa83285b68446cb38a86a259bca7e6)

## Firebase

- 구글에서 데이터베이스로 사용했었음
- 다른 Baas로는 AWS Amplify
- 다양한 API 제공
- 새로운 아이디어를 빠르게 시험해보고 싶을 때

---

- Project Setup

  - Firebase SDK 추가
    `npm install firebase`
    Firebase를 초기화하여 사용하려는 제품의 SDK를 사용

    ```jsx
    // Import the functions you need from the SDKs you need
    import { initializeApp } from "firebase/app";
    import { getAnalytics } from "firebase/analytics";
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
      apiKey: "AIzxZyBiAIx-5nQA2va9C32HO_UYlH_rhZVx8yc",
      authDomain: "fir-twitter-2021.firebaseapp.com",
      projectId: "fir-twitter-2021",
      storageBucket: "fir-twitter-2021.appspot.com",
      messagingSenderId: "565329391695",
      appId: "1:565335391695:web:7d9b0943b5f6e0b309637a",
      measurementId: "G-QTX14Y0CTY",
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    ```

    Config는 임의로 변경한 값임

- 절대 경로 설정
  `jsconfig.json` or `tsconfig.json`
  ```json
  {
    "compilerOptions": {
      "baseUrl": "src"
    },
    "include": ["src"]
  }
  ```
- 환경변수 설정
  - 환경변수 설정시 REACT_APP을 앞에 추가해 주어야 함. React 원칙
    ```yaml
    REACT_APP_API_KEY =
    REACT_APP_AUTH_DOMAIN =
    REACT_APP_PROJECT_ID =
    REACT_APP_STORAGE_BUCKET =
    REACT_APP_MESSAGIN_ID =
    REACT_APP_APP_ID =
    REACT_APP_MEASUR_ID =
    ```
    Firebase 에서 Build시 결국 env 파일은 노출된다.
    → Only for Github
- Authentication

  - use Firebase

    ```tsx
    import { getAuth } from "firebase/auth";

    export const authService = getAuth();
    ```

  - Form Structure with react-hook-form

    ```tsx
    type AuthInputs = {
      email: string;
      password: string;
    };

    function Auth() {
      const {
        register,
        getValues,
        handleSubmit,
        formState: { errors, isValid },
      } = useForm<AuthInputs>({
        mode: "onChange",
      });

      const onSubmit = () => {
        console.log(getValues());
      };

      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register("email", {
              required: "Email is required.",
              pattern: {
                value: EMAIL_VALIDATION_CHECK,
                message: "Please enter a valid email.",
              },
            })}
            type="email"
            placeholder="Email"
            className="input"
          />
          {errors.email?.message && <div>{errors.email.message}</div>}
          <input
            {...register("password", {
              required: "Password is required.",
              minLength: {
                value: 4,
                message: "Password should contain more than 4 chars.",
              },
            })}
            type="password"
            placeholder="Password"
            className="input"
          />
          {errors.password?.message && <div>{errors.password.message}</div>}
          <button disabled={isValid ? false : true}>Log In</button>
        </form>
      );
    }
    ```

  - 사용자 관리

    - 유저의 변화를 감지
    - authService.currentUser로 유저를 관리할 경우 promise를 반환하기 떄문에 항상 로그아웃 상태를 반환. useEffect를 사용할 수 있지만 간편한 API가 존재

      ```tsx
      import { getAuth, onAuthStateChanged } from "firebase/auth";

      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          const uid = user.uid;
          // ...
        } else {
          // User is signed out
          // ...
        }
      });
      ```

  - Authentication with Email

    - 이메일과 패스워드로 계정 생성 및 로그인
      ```tsx
      if (newAccount) {
        // Create Account
        try {
          const user = await createUserWithEmailAndPassword(
            authService,
            email,
            password
          );
        } catch (error) {
          // 사용중인 계정
          if (
            (error as { message: string }).message.includes(
              "auth/email-already-in-use"
            )
          ) {
            setAuthError("Account already in use");
            setNewAccount(false);
          } else {
            console.log("Unexpected create account", error);
          }
        }
      } else {
        // Sign In Account
        try {
          const user = await signInWithEmailAndPassword(
            authService,
            email,
            password
          );
        } catch (error) {
          // 계정이 없는 경우
          if (
            (error as { message: string }).message.includes(
              "auth/user-not-found"
            )
          ) {
            setAuthError("Please create an account first");
            setNewAccount(true);
          }
          // 비밀번호 틀린 경우
          else if (
            (error as { message: string }).message.includes(
              "auth/wrong-password"
            )
          ) {
            setAuthError("Wrong Password");
          } else {
            console.log("Unexpected sign in", error);
          }
        }
      }
      ```
      try catch 구문에서 error 핸들링하는게 정말 복잡했다.. (타입이 적용이 안되어 저런식으로 말도안되게 해결)
      더욱 문제는 이런식으로 여러번 Firebase에 요청할 경우 `auth/too-many-requests` Error가 발생하여 Sign In도 하지 못하는 상황
      ```tsx
      // 너무 많은 요청 발생
              else if (
                (error as { message: string }).message.includes(
                  "auth/too-many-requests"
                )
              ) {
                setAuthError("Too many requests were made. Please use it later");
              }
      ```
      추가적인 에러에 대해 작업을 해주었고 향후 더 많은 문제 발생 시 로그인과 계정생성을 분리할 예정
      또한 If else구문보다 switch 구문이 가독성과 관리 측면에서 좋을거같아 변경
    - 에러 타입 적용

      ```tsx
      enum AuthErrorType {
        "USER_EXIST" = "auth/email-already-in-use",
        "USER_NOT_FOUND" = "auth/user-not-found",
        "WRONG_PASSWORD" = "auth/wrong-password",
        "TOO_MANY_REQUESTS" = "auth/too-many-requests",
      }

      type AuthErrors = {
        message: string;
      };
      ```

    - Switch 구문으로 변경
      ```tsx
      const { email, password } = getValues();
      if (newAccount) {
        // Create Account
        try {
          const user = await createUserWithEmailAndPassword(
            authService,
            email,
            password
          );
          setAuthError(null);
          console.log("created and login", user);
        } catch (error) {
          switch ((error as AuthErrors).code) {
            // 사용중인 계정
            case AuthErrorType.USER_EXIST:
              setAuthError("Account already in use");
              setNewAccount(false);
              break;
            // 너무 많은 요청 발생
            case AuthErrorType.TOO_MANY_REQUESTS:
              setAuthError("Too many requests were made. Please use it later");
              break;
            // 예상하지 못한 에러
            default:
              console.log("Unexpected create account", error);
          }
        }
      } else {
        // Sign In Account
        try {
          const user = await signInWithEmailAndPassword(
            authService,
            email,
            password
          );
          setAuthError(null);
          console.log("login", user);
        } catch (error) {
          switch ((error as AuthErrors).code) {
            // 계정이 없는 경우
            case AuthErrorType.USER_NOT_FOUND:
              setAuthError("Please create an account first");
              setNewAccount(true);
              break;
            // 비밀번호 틀린 경우
            case AuthErrorType.WRONG_PASSWORD:
              setAuthError("Wrong Password");
              break;
            // 너무 많은 요청 발생
            case AuthErrorType.TOO_MANY_REQUESTS:
              setAuthError("Too many requests were made. Please use it later");
              break;
            // 예상하지 못한 에러
            default:
              console.log("Unexpected create account", error);
          }
        }
      }
      ```
      타입을 적용한것도 있지만 정말 가독성이 말도 안된다. switch 구문에 include를 어떻게 적용하나 별짓을 다해봤는데 구글링해보니 바로 찾았다.. (error message로 하였을때 include를 사용함)
      error code로 하니 바로 매칭이 되어 더욱 간결해짐

  - Authentication with Social Login (Google, Github)
    ```tsx
    const onSocialLogin = async ({
      currentTarget: { name },
    }: React.MouseEvent<HTMLButtonElement>) => {
      let provider, result, credential;
      try {
        switch (name) {
          case "google":
            provider = new GoogleAuthProvider();
            // This gives you a Google Access Token. You can use it to access the Google API.
            result = await signInWithPopup(authService, provider);
            credential = GoogleAuthProvider.credentialFromResult(result);
            break;
          case "github":
            provider = new GithubAuthProvider();
            result = await signInWithPopup(authService, provider);
            credential = GithubAuthProvider.credentialFromResult(result);
            break;
        }
        console.log(name, credential);
      } catch (error) {
        switch ((error as AuthErrors).code) {
          // Email이 겹치는 경우
          case AuthErrorType.EXIST_DIFFERENT_CREDENTIAL:
            setAuthError(
              "This email is being used by another account. Please log in using another method"
            );
            break;
        }
      }
    };
    ```
    너무 간단해서 할말이 없다. 다만 email이 겹치는경우 credential 에러가 발생하는데 이미 다른 경로 (email, google, github)으로 계정을 가지고 있는경우이니 다른 방법으로 로그인 하도록 안내하였다.
  - Logout
    ```tsx
    const auth = getAuth();
    auth.signOut();
    ```
    너무 간단하다

- Firestore Database

  - NoSQL DB
  - flexible
  - Collection/Document 의 구조 (폴더와 파일 같은)
  - 문서에 데이터를 처음 추가할 때 명시적으로 만들 필요 없이 Cloud Firestore에서 만들어줌
    ```tsx
    try {
      const docRef = await addDoc(collection(dbService, "tweets"), {
        tweet,
        createdAt: Date.now(),
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
    ```
    이 코드가 그냥 끝이다.
    ![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/e9733eb2-ab60-49df-ae36-77a28980a9e0/Untitled.png)
  - Read Tweets

    ```tsx
    const [tweets, setTweets] = useState<any[]>([]);

    const getTweets = async () => {
      const querySnapshot = await getDocs(collection(dbService, "tweets"));
      querySnapshot.forEach((doc) => {
        const tweetObject = {
          ...doc.data(),
          id: doc.id,
        };
        setTweets((prev) => [tweetObject, ...prev]);
      });
    };

    useEffect(() => {
      getTweets();
    }, []);
    ```

    useState에서 타입에러때문에 any를 쓰고 있다. 이부분은 다르게 처리해줘야하는데 생각보다 잘 안되고 있음.
    심지어 Snapshot을 그냥 적용하는것이 아니라 id를 추가한 Object 타입이라 이 부분은 타입에 대해 아주 명확하게 알아야 적용이 가능해보임..

  - 타입 적용

    ```tsx
    interface TweetInputs {
      tweet: string;
    }

    interface ITweetData extends TweetInputs {
      createdAt: number;
    }

    interface ITweetObj extends ITweetData {
      id: string;
    }

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
    ```

    배보다 배꼽이 더 큰상황. any가 오히려 더 가독성이 좋아보임;;

  - 유저 ID Prop 전달

    ```tsx
    export interface UserInfo {
      uid: string;
    }

    return (
      <>
        <Router //
          isLoggedIn={Boolean(isLoggedIn)}
          uid={loggedInUser.uid}
        />
        <Footer />
      </>
    );
    ```

    ```tsx
    interface IRouterProps extends UserInfo {
      isLoggedIn: boolean;
    }

    return (
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home uid={uid} />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    );
    ```

    ```tsx
    interface TweetInputs {
      tweet: string;
      creatorId: UserInfo;
    }

    interface ITweetData extends TweetInputs {
      createdAt: number;
    }

    interface ITweetObj extends ITweetData {
      id: string;
    }
    ```

    아직은 두 단계라 상태관리 툴을 사용하지 않았지만 단계가 더 많아지면 Recoil을 사용할 예정

  - 스냅샷으로 실시간 데이터 변화를 모니터링(유저 변화 감지와 유사)
    ```tsx
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
    ```
  - Edit, Delete tweet by document id
    ```tsx
    function Tweet({
      tweet,
      id: docId,
      creatorId,
      loggedInUserId,
    }: Partial<ITweetProps>) {
      const tweetRef = doc(dbService, "tweets", `${docId}`);
      const onDeleteClick = async () => {
        const ok = window.confirm("Delete Tweet?");
        if (ok) {
          // delete tweet
          await deleteDoc(doc(dbService, "tweets", `${docId}`));
        }
      };
      const onEditClick = async () => {
        // update tweet
        await updateDoc(tweetRef, {
          tweet: "하드코딩",
        });
      };
      return (
        <div>
          <h4>{tweet}</h4>
          {creatorId === loggedInUserId && (
            <>
              <button onClick={onDeleteClick}>Delete</button>
              <button onClick={onEditClick}>Edit</button>
            </>
          )}
        </div>
      );
    }
    ```
    Props를 건내줄때, 현재 로그인 유저와 작성자가 같은 경우에만 가능하도록 하였고, 역시나 코드 자체는 너무나 간단하다
    Admin 계정으로 모든 파일에 대한 권한을 갖도록 해볼까 고려중.
    → Admin 계정 Id를 조건문으로 달아두면 그냥 간단히 해결되는 것이었음.

- Storage for Image

  - Image form

    ```tsx
    const [fileUrl, setFileUrl] = useState<string>();
    const fileRef = useRef<HTMLInputElement>(null);

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

    <input
              onChange={onFileChange}
              type="file"
              accept="image/*"
              ref={fileRef}
            />

    <img src={fileUrl} alt={"tweetImg"} width="50px" height="50px" />
    <button onClick={onClearFile}>Cancle</button>
    ```

    이미지를 업로드하기 전에 onChange와 FileReader로 이미지를 URL string으로 변환하여 미리보기 기능
    미리보기 취소 시 Input File의 값을 없애주기 위해 useRef 사용

  - Image Upload
    ```tsx
    // Data URL string
    const message4 =
      "data:text/plain;base64,5b6p5Y+344GX44G+44GX44Gf77yB44GK44KB44Gn44Go44GG77yB";
    uploadString(storageRef, message4, "data_url").then((snapshot) => {
      console.log("Uploaded a data_url string!");
    });
    ```
    ```tsx
    // Data URL string
    var message =
      "data:text/plain;base64,5b6p5Y+344GX44G+44GX44Gf77yB44GK44KB44Gn44Go44GG77yB";
    ref.putString(message, "data_url").then(function (snapshot) {
      console.log("Uploaded a data_url string!");
    });
    ```
    위에가 현재 사용하고 있는 API이다. 하지만 Doc를 한국어로 보고있어서 ref에 putString을 계속 적용하려 했는데 계속 적용이 되지 않아, type definition도 살펴보고 했는데 해당 method가 정의되지 않았다. Doc를 전적으로 신뢰했기에 뭐가 잘못됐는지 계속 찾다가 혹시? 영어로 언어를 바꾸고 Doc를 다시 보니 아직 한국어는 v9가 업데이트 되지 않은 상태였다. 앞으로 한국어를 볼때는 꼭 버전확인을 해야겠다. 또 웬만하면 영어로 보자..
  - Get, Delete Image

    ```tsx
    // get ImageUrl
    if (fileUrl) {
      const response = await uploadString(storageRef, fileUrl, "data_url");
      getFileUrl = await getDownloadURL(response.ref);
    }

    // delete Image in storage
    if (imageUrl) {
      await deleteObject(ref(storageService, imageUrl));
    }
    ```

    url을 참조하여 삭제할 수 있음

- User

  - get my tweets
    ```tsx
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
    ```
    코드는 이런식인데 orderby index가 없어서 다음과 같은 에러가 발생한다.
    ![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/1d77f7c7-c9e8-4910-a94b-42179510669c/Untitled.png)
    놀랍게도 해당 링크를 클릭하면 자동으로 생성해준다.
    ![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/da1d0556-a292-4a24-ade8-73ca938f328e/Untitled.png)
  - Update User

    ```tsx
    interface IUserProps {
      providerId: string | null;
      uid: string | null;
      displayName: string | null;
      email: string | null;
      phoneNumber: string | null;
      photoURL: string | null;
    }

    import { getAuth, updateProfile } from "firebase/auth";
    const auth = getAuth();
    updateProfile(auth.currentUser, {
      displayName: "Jane Q. User",
      photoURL: "https://example.com/jane-q-user/profile.jpg",
    })
      .then(() => {
        // Profile updated!
        // ...
      })
      .catch((error) => {
        // An error occurred
        // ...
      });
    ```

    interface에 해당하는 값은 모두 업데이트 할 수 있다.
