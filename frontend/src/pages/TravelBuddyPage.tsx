import { useMemo, useState } from 'react';
import type { TravelSearchFormValues } from '../components/TravelSearchForm';
import AttractionList from '../components/AttractionList';
import type { Attraction } from '../components/AttractionList';
import BudgetTracker from '../components/BudgetTracker';
import SelectedAttractionsPanel from '../components/SelectedAttractionsPanel';
import TravelSearchForm from '../components/TravelSearchForm';
import { useSelectedAttractions } from '../hooks/useSelectedAttractions';
import { mockAttractions } from '../data/mockAttractions';
import './TravelBuddyPage.css';

function TravelBuddyPage() {
  const [searchValues, setSearchValues] = useState<TravelSearchFormValues | null>(null);
  const [searchMessage, setSearchMessage] = useState('Showing sample attractions. Submit the form to update your trip details.');
  const { selectedAttractions, duplicateError, addAttraction, removeAttraction } = useSelectedAttractions();

  const results: Attraction[] = useMemo(
    () =>
      mockAttractions.map((attraction) => ({
        id: attraction.id,
        name: attraction.name,
        description: attraction.description,
        adultPrice: attraction.adultPrice,
        childPrice: attraction.childPrice,
        adults: Number(searchValues?.adults || 2),
        children: Number(searchValues?.children || 0),
        isOpen: true,
        transportationInfo: attraction.transportationInfo,
        sourceAttribution: attraction.source,
      })),
    [searchValues],
  );

  const selectedBudget = Number(searchValues?.totalBudget || 100);

  const handleSearch = (values: TravelSearchFormValues) => {
    setSearchValues(values);
    setSearchMessage(`Showing mock attractions for ${values.destinationCity.trim()}.`);
  };

  const handleAddToPlan = (attraction: Attraction) => {
    const adultCost = attraction.adultPrice ?? 0;
    const childCost = attraction.childPrice ?? 0;
    addAttraction({
      id: attraction.id,
      name: attraction.name,
      cost: adultCost * attraction.adults + childCost * attraction.children,
    });
  };

  return (
    <main className="travel-buddy-page">
      <header className="travel-buddy-header">
        <div className="travel-buddy-header__content">
          <p className="eyebrow">YOUR NEXT ADVENTURE</p>
          <h1>TravelBuddy</h1>
          <p className="travel-buddy-header__description">
            Plan memorable days with budget-aware attraction ideas, transportation details, and a simple trip plan.
          </p>
        </div>
      </header>

      <div className="travel-buddy-content">
        <section className="travel-buddy-card travel-buddy-search" aria-labelledby="search-heading">
          <div className="travel-buddy-section-heading">
            <div>
              <p className="section-kicker">PLAN AHEAD</p>
              <h2 id="search-heading">Search attractions</h2>
            </div>
          </div>
          <TravelSearchForm onSubmit={handleSearch} />
        </section>

        <div className="travel-buddy-results-column">
          <section className="travel-buddy-card" aria-labelledby="results-heading">
            <div className="travel-buddy-section-heading">
              <div>
                <p className="section-kicker">DISCOVER</p>
                <h2 id="results-heading">Attraction results</h2>
              </div>
              <span className="travel-buddy-result-count">{results.length} available</span>
            </div>
            <p className="travel-buddy-search-message" aria-live="polite">{searchMessage}</p>
            {duplicateError && <p className="travel-buddy-error" role="alert">{duplicateError}</p>}
            <AttractionList attractions={results} onAddToPlan={handleAddToPlan} />
          </section>
        </div>

        <div className="travel-buddy-sidebar">
          <BudgetTracker
            totalBudget={selectedBudget}
            currentSpending={selectedAttractions.reduce((total, attraction) => total + attraction.cost, 0)}
          />
          <SelectedAttractionsPanel
            attractions={selectedAttractions}
            totalBudget={selectedBudget}
            onRemove={(attraction) => removeAttraction(attraction.id)}
          />
        </div>
      </div>
    </main>
  );
}

export default TravelBuddyPage;
