import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div className="flex min-h-full items-center justify-center p-6 md:p-10">
      <SignIn signUpUrl="/sign-up" forceRedirectUrl="/" />
    </div>
  );
};

export default SignInPage;
