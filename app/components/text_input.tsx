import { useField } from "remix-validated-form";

type MyInputProps = {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  multipleValues?: boolean;
  helpText?: string;
};

export const TextInput = ({
  name,
  label,
  placeholder,
  required = false,
  multipleValues = false,
  helpText
}: MyInputProps) => {
  const { error, getInputProps } = useField(name);

  return (
    <div className="form-control w-full max-w-xs">
      <label htmlFor={name} className="label">
        <span className="label-text text-accent">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>

      <input
        {...getInputProps({
          id: name,
          type: "text",
          placeholder: placeholder,
          required: required,
        })}
        className={`input input-bordered w-full max-w-xs ${error ? 'input-error' : ''}`}
      />

      {multipleValues && (
        <label className="label">
          <span className="label-text-alt text-info">
            {helpText || "Separate multiple values with commas"}
          </span>
        </label>
      )}

      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};
