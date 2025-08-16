interface GameStatusProps {
  title: string;
  subtitle: string;
}

export function GameStatus({ title, subtitle }: GameStatusProps) {
  return (
    <div className="text-center text-gray-500 mt-8 mb-auto">
      <p className="text-lg">{title}</p>
      <p className="text-sm">{subtitle}</p>
    </div>
  );
}