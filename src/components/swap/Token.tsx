export default function Token({ icon, size }: { icon: string; size: string }) {
  return (
    <img
      src={icon}
      className="rounded-full border border-dark-110"
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}
