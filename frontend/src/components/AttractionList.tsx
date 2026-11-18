import AttractionCard from './AttractionCard';
import type { AttractionCardProps } from './AttractionCard';
import './AttractionList.css';

export interface Attraction extends Omit<AttractionCardProps, 'onAddToPlan'> {
  /** Stable identifier used when rendering the attraction list. */
  id: string | number;
}

export interface AttractionListProps {
  /** Attractions to display in the results list. */
  attractions: Attraction[];
  /** Called when a user adds an attraction to their trip plan. */
  onAddToPlan: (attraction: Attraction) => void;
}

function AttractionList({ attractions, onAddToPlan }: AttractionListProps) {
  if (attractions.length === 0) {
    return (
      <section className="attraction-list attraction-list--empty" aria-live="polite">
        <p>No attractions found</p>
      </section>
    );
  }

  return (
    <section className="attraction-list" aria-label="Attraction results">
      {attractions.map((attraction) => (
        <AttractionCard
          key={attraction.id}
          {...attraction}
          onAddToPlan={() => onAddToPlan(attraction)}
        />
      ))}
    </section>
  );
}

export default AttractionList;
