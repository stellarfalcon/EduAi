import React from 'react';
import Card from './Card';
import Button from './Button';
import { Calendar } from 'lucide-react';

export interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
}

interface UpcomingEventsProps {
  events: Event[];
  showCreateButton?: boolean;
  onOpenCreateModal?: () => void;
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events, showCreateButton = false, onOpenCreateModal }) => {
  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card title="Upcoming Events" className="lg:col-span-1">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
        {showCreateButton && onOpenCreateModal && (
          <Button variant="primary" onClick={onOpenCreateModal} size="sm">
            Create Event
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="flex items-start border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <div className="flex-shrink-0 p-2 rounded-lg bg-primary-50">
                <Calendar className="h-5 w-5 text-primary-500" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{event.description}</p>
                <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatEventDate(event.event_date)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            No upcoming events
          </div>
        )}
      </div>
    </Card>
  );
};

export default UpcomingEvents; 