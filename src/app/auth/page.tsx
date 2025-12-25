import { SignUp } from "@clerk/nextjs";
const AuthPage = () => {
  return (
    <div className="w-full flex h-screen">
      <div className="w-6/10 bg-black"></div>
      <div className="w-4/10 bg-blue-800 flex items-center justify-center">
        {" "}
        <SignUp signInUrl="#" />
      </div>
    </div>
  );
};

export default AuthPage;
