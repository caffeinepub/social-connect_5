interface EmptyStateProps {
  message: string;
  imageSrc?: string;
}

export default function EmptyState({ message, imageSrc = '/assets/generated/no-posts-placeholder.dim_400x300.png' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <img src={imageSrc} alt="Empty state" className="w-64 h-48 object-contain mb-6 opacity-60" />
      <p className="text-muted-foreground text-lg">{message}</p>
    </div>
  );
}

