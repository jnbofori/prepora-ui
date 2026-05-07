import {
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";

export function EmailConfirmation() {
  return (
    <section className="m-8 flex justify-center items-center">
      {/* <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
        />
      </div> */}
      <div className="w-1/2 flex flex-col items-center justify-center mt-20">
        <div className="text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <Typography variant="h2" className="font-bold mb-4">
            Check Your Email
          </Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal mb-8">
            We've sent a confirmation email to your inbox. Please check your email and click on the confirmation link to activate your account.
          </Typography>
          <Typography variant="small" color="blue-gray" className="text-base font-normal mb-8">
            If you don't see the email, please check your spam folder.
          </Typography>
          <Link to="/auth/sign-in">
            <Button className="mt-6">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default EmailConfirmation;

