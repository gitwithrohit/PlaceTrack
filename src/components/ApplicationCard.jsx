import { Building, Calendar } from 'lucide-react';

const ApplicationCard = ({ application, isRecruiter, onUpdateStatus }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'Applied': return 'bg-blue-100 text-blue-700';
      case 'Shortlisted': return 'bg-yellow-100 text-yellow-700';
      case 'Interview': return 'bg-purple-100 text-purple-700';
      case 'Selected': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
      <div>
        <h3 className="text-lg font-bold text-gray-900">{application.jobs?.title || 'Unknown Job'}</h3>
        <div className="flex items-center gap-2 text-gray-600 mt-1">
          <Building size={16} />
          <span className="font-medium">{application.jobs?.company || 'Unknown Company'}</span>
        </div>
        {isRecruiter && (
          <div className="mt-2 text-sm text-gray-500">
            Applicant: <span className="font-medium text-gray-700">{application.profiles?.name}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
          <Calendar size={14} />
          <span>Applied on {new Date(application.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
          {application.status}
        </span>
        {isRecruiter && (
          <select 
            value={application.status} 
            onChange={(e) => onUpdateStatus && onUpdateStatus(application.id, e.target.value)}
            className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview">Interview</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        )}
      </div>
    </div>
  );
};

export default ApplicationCard;
