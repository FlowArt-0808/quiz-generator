import { redirect } from "next/navigation";

const AuthPage = () => {
  redirect("/sign-in");
};

export default AuthPage;
