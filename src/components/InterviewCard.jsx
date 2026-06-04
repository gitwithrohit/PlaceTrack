import { Calendar, Clock, Video } from 'lucide-react';

const InterviewCard = ({ interview, isRecruiter }) => {
  const date = new Date(interview.schedule_time);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow border-l-4 border-l-primary-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {interview.applications?.jobs?.title || 'Unknown Job'} Interview
          </h3>
          <p className="text-gray-600 font-medium">
            {isRecruiter 
              ? `with ${interview.applications?.profiles?.name}`
              : interview.applications?.jobs?.company}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          interview.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
          interview.status === 'Completed' ? 'bg-green-100 text-green-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {interview.status}
        </span>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600 mb-6">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-primary-500" />
          <span>{date.toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-primary-500" />
          <span>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
      
      {interview.meeting_link && (
        <a 
          href={interview.meeting_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-md font-medium transition-colors"
        >
          <Video size={18} />
          Join Meeting
        </a>
      )}
    </div>
  );
};

export default InterviewCard;
