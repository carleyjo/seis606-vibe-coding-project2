import './BudgetTracker.css';

export interface BudgetTrackerProps {
  /** Total amount available for the trip. */
  totalBudget: number;
  /** Amount already spent from the trip budget. */
  currentSpending: number;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function BudgetTracker({ totalBudget, currentSpending }: BudgetTrackerProps) {
  const remainingBudget = totalBudget - currentSpending;
  const remainingPercentage = totalBudget > 0 ? remainingBudget / totalBudget : 0;
  const isLowBudget = remainingPercentage < 0.2;

  return (
    <section className="budget-tracker" aria-labelledby="budget-tracker-heading">
      <div className="budget-tracker__heading">
        <p className="budget-tracker__eyebrow">TRIP BUDGET</p>
        <h2 id="budget-tracker-heading">Budget overview</h2>
      </div>

      <dl className="budget-tracker__summary">
        <div>
          <dt>Total Budget</dt>
          <dd>{currencyFormatter.format(totalBudget)}</dd>
        </div>
        <div>
          <dt>Money Spent</dt>
          <dd>{currencyFormatter.format(currentSpending)}</dd>
        </div>
        <div className={isLowBudget ? 'budget-tracker__remaining budget-tracker__remaining--low' : 'budget-tracker__remaining'}>
          <dt>Remaining Budget</dt>
          <dd>{currencyFormatter.format(remainingBudget)}</dd>
        </div>
      </dl>
    </section>
  );
}

export default BudgetTracker;
