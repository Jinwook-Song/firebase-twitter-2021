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
        console.log("created and login", user);
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
        console.log("login", user);
      } catch (error) {
        // 계정이 없는 경우
        if (
          (error as { message: string }).message.includes("auth/user-not-found")
        ) {
          setAuthError("Please create an account first");
          setNewAccount(true);
        }
        // 비밀번호 틀린 경우
        else if (
          (error as { message: string }).message.includes("auth/wrong-password")
        ) {
          setAuthError("Wrong Password");
        } else {
          console.log("Unexpected sign in", error);
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
