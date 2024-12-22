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
          // This combination works better on Android
          accept: "image/*;capture=camera",
          multiple: true,
        })}
        className="file-input file-input-bordered w-full max-w-xs"
      />
      <div className="text-xs text-gray-500 mt-1">
        Take photos or select from gallery
      </div>
      <label className="label">
        <span className="label-text-alt text-error">{error}</span>
      </label>
    </div>
  );
};

export default FileInput;
