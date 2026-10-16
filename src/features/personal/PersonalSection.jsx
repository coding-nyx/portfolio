import { achievementsData, interestsData } from '../../data/portfolio.js';
import './personal.css';
import FinishCelebration from './FinishCelebration.jsx';
import SpringAction from '../../shared/ui/SpringAction.jsx';

export default function PersonalSection() {
  const races = [...achievementsData].filter((item) => item.category === 'Personal').reverse();
  const otherInterests = interestsData.filter((interest) => interest !== 'Obstacle Course Races');

  return (
    <div className="port-section personal-section">
      <header className="personal-heading">
        <p className="port-eyebrow">Off the clock</p>
        <h2 id="h-personal" tabIndex={-1}>
          A few things I’m into
        </h2>
      </header>
      <div className="personal-races">
        {races.map((race) => (
          <figure className="race-card" key={race.id}>
            <div className={`race-photo race-photo-${race.id}`}>
              <img
                src={race.imageUrl}
                srcSet={`${race.imageUrl.replace('.webp', '-800.webp')} 800w, ${race.imageUrl} 1600w`}
                sizes={
                  race.id === 'devils-circuit'
                    ? '(max-width: 700px) 180vw, (max-width: 1228px) 90vw, 1040px'
                    : '(max-width: 700px) calc(100vw - 32px), (max-width: 1228px) calc((100vw - 120px) / 2), 554px'
                }
                alt={race.imageAlt}
                width="1600"
                height={race.id === 'devils-circuit' ? '1067' : '2133'}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption>
              <div className="race-caption-top">
                <span className="race-year">{race.year}</span>
                <FinishCelebration title={race.title} />
              </div>
              <h3>{race.title}</h3>
              <p>{race.event}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="personal-interests">
        <h3>Also into</h3>
        <ul>
          {otherInterests.map((interest) => (
            <li key={interest}>{interest}</li>
          ))}
        </ul>
      </div>
      <SpringAction as="a" className="chapter-next" href="#contact" data-sec="contact">
        Next: <b>Contact ↓</b>
      </SpringAction>
    </div>
  );
}
