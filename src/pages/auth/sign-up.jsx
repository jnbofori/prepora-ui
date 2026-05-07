import {
  Button,
  Typography,
} from "@material-tailwind/react";
import MyTextInput from "@/components/MyTextInput";
import MyCheckbox from "@/components/MyCheckbox";
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import { Link, useNavigate } from "react-router-dom";
import api from "@/api/axios";

export function SignUp() {
  const navigate = useNavigate();

  return (
    <section className="m-8 flex items-center">
      <div className="w-2/5 hidden lg:block flex flex-col items-center justify-center">
        <img
          src="/img/auth-man.png"
          className="w-full object-cover rounded-3xl"
          style={{height: "90vh"}}
        />
      </div>
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-1">Join Us Today</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">Enter your information to register.</Typography>
        </div>
        <Formik
          initialValues={{
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            termsAndConditions: false
          }}
          validationSchema={Yup.object({
            email: Yup.string()
              .email('Invalid email address')
              .required('Required'),
            password: Yup.string()
              .min(8, 'Must be at least 8 characters')
              .required('Required'),
            firstName: Yup.string()
              .required('Required'),
            lastName: Yup.string()
              .required('Required'),
            phoneNumber: Yup.string()
              .required('Required'),
            termsAndConditions: Yup.boolean()
              .oneOf([true], 'You must accept the terms and conditions')
          })}
          onSubmit={async (values, { setErrors, setSubmitting }) => {
            try {
              const { termsAndConditions, ...registerData } = values;
              await api.post('/account/register', registerData);
              navigate('/auth/email-confirmation');
            } catch (error) {
              setErrors({ 
                email: error?.response?.data?.message || error?.message || 'Registration failed. Please try again.' 
              });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <Form className="mt-2 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
            <div className="mb-0 flex flex-col gap-2">
              <MyTextInput
                type="email"
                size="lg"
                name="email"
                label="Email"
                placeholder="name@mail.com"
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
              <MyTextInput
                type="text"
                size="lg"
                name="firstName"
                label="First Name"
                placeholder="Enter your first name"
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
              <MyTextInput
                type="text"
                size="lg"
                name="lastName"
                label="Last Name"
                placeholder="Enter your last name"
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
              <MyTextInput
                type="tel"
                size="lg"
                name="phoneNumber"
                label="Phone Number"
                placeholder="+233204556789"
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
            <Button className="mt-2" fullWidth type="submit">
              Register Now
            </Button>

            <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
              Already have an account?
              <Link to="/auth/sign-in" className="text-gray-900 ml-1">Sign in</Link>
            </Typography>
          </Form>
        </Formik>
      </div>
    </section>
  );
}

export default SignUp;
