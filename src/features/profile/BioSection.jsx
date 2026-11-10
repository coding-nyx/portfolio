import './profile.css';
import { FiArrowUpRight, FiMapPin, FiBriefcase, FiCalendar, FiLayers } from 'react-icons/fi';
import { profileData, experienceData } from '../../data/portfolio.js';
import NextChapter from '../../shared/ui/NextChapter.jsx';
import './bio-study.css';

export default function BioSection() {
  const work = experienceData.find((item) => item.type === 'Full-time') || experienceData[0];
  const since = new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${work.startDate}-01T00:00:00Z`));
  const facts = [
    { label: 'Location', Icon: FiMapPin, value: profileData.location },
    { label: 'Role', Icon: FiBriefcase, value: work.role, detail: work.company },
    { label: 'Full-time', Icon: FiCalendar, value: `Since ${since}` },
    { label: 'Primary stack', Icon: FiLayers, value: profileData.bio.primaryStack.join(' · ') },
  ];

  return (
    <div className="port-section study-bio bio-natural">
      <div className="bio-natural-layout">
        <h2 id="h-bio" className="bio-natural-title" tabIndex={-1}>
          Hi, I’m {profileData.bio.preferredName}.
        </h2>
        <div className="bio-natural-profile">
          <figure className="bio-natural-portrait" data-whimsy-surface="portrait">
            <img
              src={profileData.profileImage}
              alt={profileData.name}
              width="960"
              height="896"
              loading="lazy"
              decoding="async"
            />
            <figcaption>{profileData.bio.preferredName}</figcaption>
          </figure>
          <dl className="bio-natural-facts" aria-label="Profile at a glance">
            {facts.map(({ label, Icon, value, detail }) => (
              <div className="bio-natural-fact" key={label}>
                <dt>
                  <Icon size={15} aria-hidden="true" />
                  <span>{label}</span>
                </dt>
                <dd>
                  {value}
                  {detail && <span>{detail}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="study-bio-copy bio-natural-copy">
          <section className="bio-natural-story" aria-labelledby="bio-about-me">
            <h3 id="bio-about-me">About me</h3>
            {profileData.bio.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <a className="study-bio-personal bio-natural-personal" href="#personal">
              {profileData.bio.personalLinkLabel}
              <FiArrowUpRight aria-hidden="true" />
            </a>
          </section>
        </div>
      </div>
      <NextChapter id="experience">Experience</NextChapter>
    </div>
  );
}
