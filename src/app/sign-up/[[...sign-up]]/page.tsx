import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => {
  return (
    <div className="flex min-h-full items-center justify-center p-6 md:p-10">
      <SignUp signInUrl="/sign-in" forceRedirectUrl="/" />
    </div>
  );
};

export default SignUpPage;
