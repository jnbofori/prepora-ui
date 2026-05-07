import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import MyTextInput from "@/components/MyTextInput";
import MyCheckbox from "@/components/MyCheckbox";
import * as Yup from 'yup';

import { Formik, Form } from 'formik';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function SignIn() {
  const { login } = useAuth()

  let navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard/home";
  
  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Sign In</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">Enter your email and password to Sign In.</Typography>
        </div>
        
        <Formik
          initialValues={{ email: '', password: '', termsAndConditions: false }}
          validationSchema={Yup.object({
            email: Yup.string()
              .email('Invalid email address')
              .required('Required'),
            password: Yup.string()
              .min(8, 'Must be at least 8 characters')
              .required('Required'),
            termsAndConditions: Yup.boolean()
          })}
          onSubmit={(values, { setErrors }) => {
            login(values)
              .then(() => {
                navigate(from, { replace: true });
              })
              .catch(error => setErrors({ email: error?.message }))
          }}
        >
          <Form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
            <div className="mb-1 flex flex-col gap-4">
              <MyTextInput
                type="email"
                size="lg"
                name="email"
                label="Email"
                placeholder="Enter your email"
                // don't really need these props; mainly for extra styling
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
              <MyTextInput
                type="password"
                size="lg"
                name="password"
                label="Password"
                placeholder="********"
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

            <MyCheckbox
              name="termsAndConditions"
              label={
                <Typography
                  variant="small"
                  color="gray"
                  className="flex items-center justify-start font-medium"
                >
                  I agree the&nbsp;
                  <a
                    href="#"
                    className="font-normal text-black transition-colors hover:text-gray-900 underline"
                  >
                    Terms and Conditions
                  </a>
                </Typography>
              }
              containerProps={{ className: "-ml-2.5" }}
            />
            <Button className="mt-6" fullWidth type="submit">
              Sign In
            </Button>

            <div className="flex items-center justify-between gap-2 mt-6">
              <Typography variant="small" className="font-medium text-gray-900">
                <a href="#">
                  Forgot Password
                </a>
              </Typography>
            </div>

            <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
              Not registered?
              <Link to="/auth/sign-up" className="text-gray-900 ml-1">Create account</Link>
            </Typography>
          </Form>
        </Formik>
      </div>
      <div className="w-2/5 h-50 hidden lg:block">
        <img
          src="/img/auth-woman.png"
          className="object-cover rounded-3xl"
          style={{height: "90%"}}
        />
      </div>

    </section>
  );
}

export default SignIn;
