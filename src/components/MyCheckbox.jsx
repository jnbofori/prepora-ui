import { useField } from "formik";
import { Typography, Checkbox } from "@material-tailwind/react";

export default function MyCheckbox(props) {
  const [field, meta] = useField({ ...props, type: 'checkbox' })

  return (
    <>
      <Checkbox {...field} {...props}/>
      {meta.touched && meta.error ? (
        <Typography variant="small" color="red">{meta.error}</Typography>
      ) : null}
    </>
  )
}