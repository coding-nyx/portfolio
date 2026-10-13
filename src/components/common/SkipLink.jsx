import styled from 'styled-components';

const SkipAnchor = styled.a`
  position: absolute;
  top: -1000px;
  left: -1000px;
  background: var(--neon-pink);
  color: #fff;
  padding: 8px 8px;
  z-index: 9999;
  text-decoration: none;
  font-weight: bold;
  border: 2px solid #fff;

  &:focus {
    top: 20px;
    left: 20px;
    outline: none;
    box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.5);
  }

  [data-theme='modern'] &,
  [data-theme='professional'] & {
    background: var(--neon-cyan);
    color: var(--on-accent);
  }
`;

const SkipLink = () => {
  return (
    <SkipAnchor href="#main-content">
      Skip to main content
    </SkipAnchor>
  );
};

export default SkipLink;
