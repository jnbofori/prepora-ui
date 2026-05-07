import { useField } from "formik";
import { Select, Typography, Option } from "@material-tailwind/react";

export default function MySelectInput({ label, ...props }) {
  const [field, meta] = useField(props.name)

  const options = props.options || [];

  return (
    <>
      <Typography variant="small" color="blue-gray" className="mb-0 font-medium">
        {label}
      </Typography>
      <Select {...field} {...props} >
        {options.map(({ text, value }) => (
          <Option key={value} value={value}>
            {text}
          </Option>
        ))}
      </Select>
      {meta.touched && meta.error ? (
        <Typography variant="small" color="red">{meta.error}</Typography>
      ) : null}
    </>
  )
}