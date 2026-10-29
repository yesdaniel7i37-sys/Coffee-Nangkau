const tones = ["bg-amber-600", "bg-orange-600", "bg-amber-700", "bg-yellow-700"];

// Avatar lingkaran berisi inisial nama (pengganti foto orang)
export default function Avatar({ name, index = 0, className = "w-12 h-12 text-base" }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <div
      aria-hidden="true"
      className={`${tones[index % tones.length]} rounded-full flex items-center justify-center font-bold text-white shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
