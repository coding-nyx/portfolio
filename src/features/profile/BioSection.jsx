import './profile.css';
import { createElement } from 'react';
import { FiMapPin, FiBriefcase, FiCalendar, FiLayers } from 'react-icons/fi';
import { profileData, experienceData } from '../../data/portfolio.js';
import { publicText } from '../../utils/publicText.js';
import NextChapter from '../../shared/ui/NextChapter.jsx';

export default function BioSection() {
  const rows = [
    [FiMapPin, 'Location', profileData.location],
    [FiBriefcase, 'Role', experienceData[0].role],
    [FiCalendar, 'Experience', 'Since May 2022'],
    [FiLayers, 'Stack', 'Swift · UIKit · SwiftUI · SPM'],
  ];
  return (
    <div className="port-section bio-b" data-design="Bio B">
      <div className="bio-card">
        <div className="bio-top">
          <img
            className="bio-avatar"
            src={profileData.profileImage}
            alt="Raj Kumar S"
            width="96"
            height="96"
          />
          <h2 id="h-bio" tabIndex={-1}>
            {profileData.name}
          </h2>
          <p>{profileData.roleTitle}</p>
        </div>
        <p className="bio-intro">{publicText(profileData.summary)}</p>
        <div className="bio-group">
          {rows.map(([icon, label, value]) => (
            <div className="bio-row" key={label}>
              <i aria-hidden="true">{createElement(icon, { size: 20, focusable: false })}</i>
              <b>{label}</b>
              <span>{value}</span>
            </div>
          ))}
        </div>
        <a className="bio-personal-link" href="#personal">
          Outside work: obstacle courses & other interests ↗
        </a>
      </div>
      <NextChapter id="experience">Experience</NextChapter>
    </div>
  );
}
