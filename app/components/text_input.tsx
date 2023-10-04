import { useField } from "remix-validated-form";

type MyInputProps = {
  name: string;
  label: string;
  placeholder: string;
};

export const TextInput = ({ name, label, placeholder }: MyInputProps) => {
  const { error, getInputProps } = useField(name);
  return (
    <div>
      <label htmlFor={name} className="label">
        <span className="label-text text-accent">{label}</span>
      </label>

      <input
        {...getInputProps({
          id: name,
          type: "text",
          placeholder: placeholder,
        })}
        className="input input-bordered w-full max-w-xs"
      />
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};
