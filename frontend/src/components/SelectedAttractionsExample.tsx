import AttractionList from './AttractionList';
import SelectedAttractionsPanel from './SelectedAttractionsPanel';
import { useSelectedAttractions } from '../hooks/useSelectedAttractions';
import type { Attraction } from './AttractionList';

interface SelectedAttractionsExampleProps {
  attractions: Attraction[];
  totalBudget: number;
}

function SelectedAttractionsExample({
  attractions,
  totalBudget,
}: SelectedAttractionsExampleProps) {
  const {
    selectedAttractions,
    duplicateError,
    addAttraction,
    removeAttraction,
    clearDuplicateError,
  } = useSelectedAttractions();

  const handleAddToPlan = (attraction: Attraction) => {
    addAttraction({
      id: attraction.id,
      name: attraction.name,
      cost: attraction.adultPrice !== null && attraction.childPrice !== null
        ? attraction.adultPrice * attraction.adults + attraction.childPrice * attraction.children
        : 0,
    });
  };

  return (
    <div>
      {duplicateError && (
        <p role="alert" onClick={clearDuplicateError}>
          {duplicateError}
        </p>
      )}
      <AttractionList attractions={attractions} onAddToPlan={handleAddToPlan} />
      <SelectedAttractionsPanel
        attractions={selectedAttractions}
        totalBudget={totalBudget}
        onRemove={(attraction) => removeAttraction(attraction.id)}
      />
    </div>
  );
}

export default SelectedAttractionsExample;
