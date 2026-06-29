interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = 'Đang phân tích CV...' }: LoadingOverlayProps) {
  return (
    <div className="relative flex flex-col items-center justify-center py-16 px-6">
      {/* Spinner */}
      <div
        className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"
        role="status"
        aria-label="Đang tải"
      />

      {/* Message */}
      <p className="mt-4 text-sm text-gray-500 font-medium">{message}</p>
    </div>
  );
}
