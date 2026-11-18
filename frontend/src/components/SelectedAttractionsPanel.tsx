import './SelectedAttractionsPanel.css';

export interface SelectedAttraction {
  /** Stable identifier for the selected attraction. */
  id: string | number;
  /** Name displayed in the selected attractions list. */
  name: string;
  /** Calculated admission cost for this attraction and the travel group. */
  cost: number;
}

export interface SelectedAttractionsPanelProps {
  /** Attractions currently selected by the user. */
  attractions: SelectedAttraction[];
  /** Total budget available for attractions. */
  totalBudget: number;
  /** Called when the user removes an attraction from the plan. */
  onRemove: (attraction: SelectedAttraction) => void;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function SelectedAttractionsPanel({
  attractions,
  totalBudget,
  onRemove,
}: SelectedAttractionsPanelProps) {
  const totalSpending = attractions.reduce((total, attraction) => total + attraction.cost, 0);
  const remainingBudget = totalBudget - totalSpending;
  const hasExceededBudget = remainingBudget < 0;

  return (
    <aside className="selected-attractions-panel" aria-labelledby="selected-attractions-heading">
      <div className="selected-attractions-panel__heading">
        <div>
          <p className="selected-attractions-panel__eyebrow">YOUR ITINERARY</p>
          <h2 id="selected-attractions-heading">Selected attractions</h2>
        </div>
        <span className="selected-attractions-panel__count">{attractions.length}</span>
      </div>

      {attractions.length === 0 ? (
        <p className="selected-attractions-panel__empty">No attractions selected yet.</p>
      ) : (
        <ul className="selected-attractions-panel__list">
          {attractions.map((attraction) => (
            <li key={attraction.id}>
              <span>{attraction.name}</span>
              <span className="selected-attractions-panel__item-cost">
                {currencyFormatter.format(attraction.cost)}
              </span>
              <button type="button" onClick={() => onRemove(attraction)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <dl className="selected-attractions-panel__summary">
        <div>
          <dt>Total spending</dt>
          <dd>{currencyFormatter.format(totalSpending)}</dd>
        </div>
        <div className={hasExceededBudget ? 'selected-attractions-panel__remaining selected-attractions-panel__remaining--over' : 'selected-attractions-panel__remaining'}>
          <dt>Remaining budget</dt>
          <dd>{currencyFormatter.format(remainingBudget)}</dd>
        </div>
      </dl>
    </aside>
  );
}

export default SelectedAttractionsPanel;
