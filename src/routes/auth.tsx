import { useForm } from "react-hook-form";
import { EMAIL_VALIDATION_CHECK } from "../types.d";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { authService } from "../firebase";
import { useState } from "react";

type AuthInputs = {
  email: string;
  password: string;
};

enum AuthErrorType {
  "USER_EXIST" = "auth/email-already-in-use",
  "USER_NOT_FOUND" = "auth/user-not-found",
  "WRONG_PASSWORD" = "auth/wrong-password",
  "TOO_MANY_REQUESTS" = "auth/too-many-requests",
  "EXIST_DIFFERENT_CREDENTIAL" = "auth/account-exists-with-different-credential",
}

type AuthErrors = {
  message: string;
  code: string;
};

function Auth() {
  const [authError, setAuthError] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState(true);
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AuthInputs>({
    mode: "onChange",
  });

  const onEmailLogin = async () => {
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
  };

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

  return (
    <div>
      <form onSubmit={handleSubmit(onEmailLogin)}>
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
        <button disabled={isValid ? false : true}>
          {newAccount ? "Create Account" : "Sign In"}
        </button>
        {authError && <span>{authError}</span>}
      </form>
      <button name="google" onClick={onSocialLogin}>
        Continue with Google
      </button>
      <button name="github" onClick={onSocialLogin}>
        Continue with Github
      </button>
    </div>
  );
}

export default Auth;
