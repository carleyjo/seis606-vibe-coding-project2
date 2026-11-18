import { useMemo } from 'react';
import './AttractionCard.css';

export interface AttractionCardProps {
  /** Name shown as the attraction card heading. */
  name: string;
  /** Short overview of the attraction. */
  description: string;
  /** Admission price for one adult. */
  adultPrice: number | null;
  /** Admission price for one child, when available. */
  childPrice: number | null;
  /** Number of adults whose admission should be included in the total. */
  adults: number;
  /** Number of children whose admission should be included in the total. */
  children: number;
  /** Whether the attraction is open for the selected travel dates. */
  isOpen: boolean;
  /** Public transportation details, or a message when unavailable. */
  transportationInfo: string;
  /** Provider attribution for the attraction information. */
  sourceAttribution: string;
  /** Called when the user adds this attraction to their trip plan. */
  onAddToPlan: () => void;
  /** Indicates that this attraction has already been added. */
  isAdded?: boolean;
}

function formatPrice(price: number | null): string {
  return price === null ? 'Unavailable' : `$${price.toFixed(2)}`;
}

function AttractionCard({
  name,
  description,
  adultPrice,
  childPrice,
  adults,
  children,
  isOpen,
  transportationInfo,
  sourceAttribution,
  onAddToPlan,
  isAdded = false,
}: AttractionCardProps) {
  const totalCost = useMemo(() => {
    if (adultPrice === null || childPrice === null) {
      return null;
    }

    return adultPrice * adults + childPrice * children;
  }, [adultPrice, adults, childPrice, children]);

  return (
    <article className="attraction-card">
      <div className="attraction-card__header">
        <div>
          <p className="attraction-card__eyebrow">ATTRACTION</p>
          <h2>{name}</h2>
        </div>
        <span className={`attraction-card__status${isOpen ? ' attraction-card__status--open' : ''}`}>
          {isOpen ? 'Open' : 'Closed'}
        </span>
      </div>

      <p className="attraction-card__description">{description}</p>

      <dl className="attraction-card__details">
        <div>
          <dt>Adult price</dt>
          <dd>{formatPrice(adultPrice)}</dd>
        </div>
        <div>
          <dt>Child price</dt>
          <dd>{formatPrice(childPrice)}</dd>
        </div>
        <div className="attraction-card__total">
          <dt>Total cost</dt>
          <dd>{totalCost === null ? 'Unavailable' : `$${totalCost.toFixed(2)}`}</dd>
        </div>
      </dl>

      <div className="attraction-card__information">
        <div>
          <h3>Transportation</h3>
          <p>{transportationInfo}</p>
        </div>
        <div>
          <h3>Source</h3>
          <p>{sourceAttribution}</p>
        </div>
      </div>

      <button
        className="attraction-card__button"
        type="button"
        onClick={onAddToPlan}
        disabled={isAdded || !isOpen}
      >
        {isAdded ? 'Added to Plan' : isOpen ? 'Add to Plan' : 'Currently Closed'}
      </button>
    </article>
  );
}

export default AttractionCard;
