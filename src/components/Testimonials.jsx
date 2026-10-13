import { useState } from 'react';
import styled from 'styled-components';
import PixelCard from './common/PixelCard';
import { testimonialsData } from '../data/portfolio';
import { FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const TestimonialCard = styled.div`
  /* Cyberpunk style matching ProjectCard */
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--text-dim);
  padding: 24px 32px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180px;

  /* Professional Theme */
  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }

  [data-theme='cyberpunk'] & {
    border-color: var(--neon-pink);
    box-shadow: 2px 2px 0 var(--neon-cyan);
  }
`;

const QuoteIconWrapper = styled.div`
  color: var(--neon-pink);
  opacity: 0.4;
  margin-bottom: 8px;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--neon-cyan);
    opacity: 0.3;
  }
`;

const QuoteText = styled.blockquote`
  font-size: 0.95rem;
  font-style: italic;
  color: var(--text-main);
  line-height: 1.6;
  margin: 0 0 16px 0;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--text-muted);
  }
`;

const AuthorMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-color);

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    border-top: 1px solid var(--surface-raised);
  }
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AuthorName = styled.span`
  color: var(--neon-cyan);
  font-weight: 700;
  font-size: 0.9rem;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--text-main);
  }
`;

const AuthorRole = styled.span`
  font-size: 0.78rem;
  color: var(--text-dim);

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--text-dim);
  }
`;

const CompanyBadge = styled.span`
  font-size: 0.7rem;
  padding: 4px 8px;
  background: var(--neon-cyan);
  color: var(--bg-color);
  font-weight: bold;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: var(--accent-soft);
    color: var(--accent-hover);
    border: 1px solid var(--accent-border);
    border-radius: 4px;
    font-weight: 500;
  }
`;

const ControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 0 4px;
`;

const Indicators = styled.div`
  display: flex;
  gap: 8px;
`;

const Dot = styled.button`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: ${props => props.$active ? 'var(--neon-pink)' : 'var(--text-dim)'};
  transition: all 0.2s ease;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: ${props => props.$active ? 'var(--neon-cyan)' : 'var(--border-strong)'};
    width: ${props => props.$active ? '18px' : '8px'};
    border-radius: 9999px;
  }
`;

const NavBtn = styled.button`
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  [data-theme='cyberpunk'] & {
    border-color: var(--neon-cyan);
    color: var(--neon-cyan);

    &:hover {
      background: var(--neon-cyan);
      color: #000;
    }
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    color: var(--text-dim);
    border-radius: 50%;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &:hover {
      background: var(--neon-cyan);
      color: var(--on-accent);
      border-color: var(--neon-cyan);
    }
  }
`;

const Testimonials = () => {
  const [current, setCurrent] = useState(0);
  const length = testimonialsData.length;

  const nextSlide = () => {
    setCurrent(current === length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? length - 1 : current - 1);
  };

  if (!Array.isArray(testimonialsData) || testimonialsData.length <= 0) {
    return null;
  }

  const testimonial = testimonialsData[current];

  return (
    <PixelCard title="Endorsements & Testimonials">
      <TestimonialCard>
        <div>
          <QuoteIconWrapper>
            <FaQuoteLeft size={20} />
          </QuoteIconWrapper>
          <QuoteText>"{testimonial.quote}"</QuoteText>
        </div>
        <AuthorMeta>
          <AuthorInfo>
            <AuthorName>{testimonial.name}</AuthorName>
            <AuthorRole>{testimonial.title}</AuthorRole>
          </AuthorInfo>
          <CompanyBadge>Zoho Colleague</CompanyBadge>
        </AuthorMeta>
      </TestimonialCard>

      <ControlsRow>
        <NavBtn onClick={prevSlide} aria-label="Previous testimonial">
          <FaChevronLeft size={11} />
        </NavBtn>
        <Indicators>
          {testimonialsData.map((_, idx) => (
            <Dot
              key={idx}
              $active={idx === current}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </Indicators>
        <NavBtn onClick={nextSlide} aria-label="Next testimonial">
          <FaChevronRight size={11} />
        </NavBtn>
      </ControlsRow>
    </PixelCard>
  );
};

export default Testimonials;
