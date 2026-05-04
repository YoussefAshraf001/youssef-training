type Props = {
  name?: string;
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  className?: string;
};

export default function FormInput({
  name,
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  className = "",
}: Props) {
  return (
    <input
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      autoComplete={autoComplete}
      className={`border border-zinc-200 rounded-lg px-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${className}`}
    />
  );
}
