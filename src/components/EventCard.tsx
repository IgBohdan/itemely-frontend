import { Event } from '../types';

export default function EventCard({ event }: { event: Event }) {
  return (
    <div>
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <small>{new Date(event.startTime).toLocaleString()}</small>
    </div>
  );
}
