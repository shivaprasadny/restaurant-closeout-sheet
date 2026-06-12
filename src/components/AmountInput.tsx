/**
 * Reusable input box.
 * We will use this later for amount fields.
 */

type Props = {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
};

export default function AmountInput({ value, onChange, readOnly }: Props) {
  return (
    <input
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}