import { useContext } from "react";
import { FormikContext, getIn } from "formik";
import { Input, Typography } from "@material-tailwind/react";

export default function MyTextInput({ label, name, error, ...props }) {
  const formik = useContext(FormikContext);
  const inFormik = Boolean(formik && name);

  const value = inFormik ? getIn(formik.values, name) ?? "" : props.value;
  const onChange = inFormik
    ? (event) => formik.setFieldValue(name, event.target.value)
    : props.onChange;
  const onBlur = inFormik ? () => formik.setFieldTouched(name, true) : props.onBlur;

  const fieldError = inFormik ? getIn(formik.errors, name) : error;
  const touched = inFormik ? getIn(formik.touched, name) : false;
  const showError = inFormik ? touched || formik.submitCount > 0 : Boolean(fieldError);

  return (
    <>
      {label ? (
        <Typography variant="small" color="blue-gray" className="mb-0 font-medium">
          {label}
        </Typography>
      ) : null}
      <Input
        {...props}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      {showError && fieldError ? (
        <Typography variant="small" color="red" className="my-0">{fieldError}</Typography>
      ) : null}
    </>
  );
}