import { useField } from "remix-validated-form";

type MyInputProps = {
  name: string;
  label: string;
  placeholder: string;
};

export const TextAreaInput = ({ name, label, placeholder }: MyInputProps) => {
  const { error, getInputProps } = useField(name);
  return (
    <div>
      <label htmlFor={name} className="label">
        <span className="label-text text-accent">{label}</span>
      </label>

      <textarea
        {...getInputProps({
          id: name,
          placeholder: placeholder,
        })}
        className="textarea textarea-bordered w-full max-w-xs"
      ></textarea>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};
