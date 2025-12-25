import { SignUp } from "@clerk/nextjs";
const AuthPage = () => {
  return (
    <div className="w-fit flex items-center justify-center">
      <SignUp />
    </div>
  );
};

export default AuthPage;
