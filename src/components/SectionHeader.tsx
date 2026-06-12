/**
 * Reusable section header.
 * Used by tables that have a title and optional add button.
 */

type Props = {
  title: string;
  buttonText?: string;
  onAdd?: () => void;
};

export default function SectionHeader({
  title,
  buttonText,
  onAdd,
}: Props) {
  return (
    <div className="section-title-row">
      <h2>{title}</h2>

      {buttonText && (
        <button className="small-btn no-print" onClick={onAdd}>
          {buttonText}
        </button>
      )}
    </div>
  );
}