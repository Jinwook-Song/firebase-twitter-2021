import { useForm } from "react-hook-form";
import { EMAIL_VALIDATION_CHECK } from "types.d";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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
}

type AuthErrors = {
  message: string;
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

  const onSubmit = async () => {
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
        switch (true) {
          // 사용중인 계정
          case (error as AuthErrors).message //
            .includes(AuthErrorType.USER_EXIST):
            setAuthError("Account already in use");
            setNewAccount(false);
            break;
          // 너무 많은 요청 발생
          case (error as AuthErrors).message //
            .includes(AuthErrorType.TOO_MANY_REQUESTS):
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
        switch (true) {
          // 계정이 없는 경우
          case (error as AuthErrors).message //
            .includes(AuthErrorType.USER_NOT_FOUND):
            setAuthError("Please create an account first");
            setNewAccount(true);
            break;
          // 비밀번호 틀린 경우
          case (error as AuthErrors).message //
            .includes(AuthErrorType.WRONG_PASSWORD):
            setAuthError("Wrong Password");
            break;
          // 너무 많은 요청 발생
          case (error as AuthErrors).message //
            .includes(AuthErrorType.TOO_MANY_REQUESTS):
            setAuthError("Too many requests were made. Please use it later");
            break;
          // 예상하지 못한 에러
          default:
            console.log("Unexpected create account", error);
        }
      }
    }
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
      <button disabled={isValid ? false : true}>
        {newAccount ? "Create Account" : "Sign In"}
      </button>
      {authError && <span>{authError}</span>}
    </form>
  );
}

export default Auth;
