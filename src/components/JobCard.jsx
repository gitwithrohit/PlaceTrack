import { Briefcase, MapPin, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const JobCard = ({ job, role, onApply }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
          <p className="text-primary-600 font-medium">{job.company}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {job.status === 'open' ? 'Active' : 'Closed'}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">{job.description}</p>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="flex gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>Remote</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign size={16} />
            <span>Competitive</span>
          </div>
        </div>
        
        {role === 'student' && job.status === 'open' && (
          <button onClick={() => onApply && onApply(job.id)} className="bg-primary-50 text-primary-700 px-4 py-2 rounded-md font-medium hover:bg-primary-100 transition-colors">
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
