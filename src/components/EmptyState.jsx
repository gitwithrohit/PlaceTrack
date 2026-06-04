import { FolderX } from 'lucide-react';

const EmptyState = ({ title, message, icon: Icon = FolderX, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="bg-gray-50 p-4 rounded-full mb-4 text-gray-400">
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
