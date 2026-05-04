type Props = {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
};

export default function FormTextarea({
  name,
  value,
  onChange,
  placeholder,
  rows = 5,
}: Props) {
  return (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="border border-zinc-300 rounded-xl w-full min-h-12 pl-6 pt-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  );
}
