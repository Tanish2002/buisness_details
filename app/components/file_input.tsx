import { useField } from "remix-validated-form";

type MyInputProps = {
  name: string;
  label: string;
};
const FileInput = ({ name, label }: MyInputProps) => {
  const { error, getInputProps } = useField(name);
  return (
    <div>
      <label htmlFor={name} className="label">
        <span className="label-text text-accent">{label}</span>
      </label>
      <input
        {...getInputProps({
          id: name,
          type: "file",
          accept: ".jpg, .jpeg, .png",
          multiple: true,
        })}
        className="file-input file-input-bordered w-full max-w-xs"
      />
      <label className="label">
        <span className="label-text-alt text-error">{error}</span>
      </label>
    </div>
  );
};

export default FileInput;
