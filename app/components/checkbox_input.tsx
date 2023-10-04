import { useField } from "remix-validated-form";

type MyInputProps = {
  name: string;
  label: string;
  value: string;
};

export const CheckBoxInput = ({ name, label, value }: MyInputProps) => {
  const { error, getInputProps } = useField(name);

  return (
    <div>
      <label className="label cursor-pointer">
        <span className="label-text">{label}</span>
        <input
          {...getInputProps({
            id: name,
            type: "checkbox",
            value: value,
            className: "checkbox",
          })}
        />
      </label>
      {error && (
        <label className="label">
          <span className="label-text-alt">{error}</span>
        </label>
      )}
    </div>
  );
};
