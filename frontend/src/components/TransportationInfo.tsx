import './TransportationInfo.css';

export interface TransportationInfoProps {
  /** Bus routes or bus service details for the attraction. */
  busInformation?: string | null;
  /** Train lines, stations, or rail service details for the attraction. */
  trainInformation?: string | null;
  /** Additional transportation guidance or limitations. */
  additionalNotes?: string | null;
  /** Source used for the transportation information. */
  dataSource?: string | null;
}

const unavailableMessage = 'Information Not Available';

function displayValue(value?: string | null): string {
  return value?.trim() || unavailableMessage;
}

function TransportationInfo({
  busInformation,
  trainInformation,
  additionalNotes,
  dataSource,
}: TransportationInfoProps) {
  const details = [
    { label: 'Bus Information', value: busInformation },
    { label: 'Train Information', value: trainInformation },
    { label: 'Additional Transportation Notes', value: additionalNotes },
    { label: 'Data Source', value: dataSource },
  ];

  return (
    <section className="transportation-info" aria-labelledby="transportation-info-heading">
      <div className="transportation-info__heading">
        <p className="transportation-info__eyebrow">GETTING THERE</p>
        <h2 id="transportation-info-heading">Transportation Information</h2>
      </div>

      <dl className="transportation-info__details">
        {details.map(({ label, value }) => (
          <div className="transportation-info__item" key={label}>
            <dt>{label}</dt>
            <dd>{displayValue(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default TransportationInfo;
