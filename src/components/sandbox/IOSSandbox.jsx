import { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import PixelCard from '../common/PixelCard';
import { FaApple, FaBolt, FaLayerGroup, FaCheckCircle, FaRobot } from 'react-icons/fa';

const SandboxContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  width: 100%;

  @media (min-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const InteractivePanel = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  position: relative;
  overflow: hidden;

  [data-theme='cyberpunk'] & {
    background: rgba(10, 10, 20, 0.6);
    border-color: rgba(0, 243, 255, 0.3);
    box-shadow: inset 0 0 15px rgba(0, 243, 255, 0.05);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #f8fafc;
    border-color: #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
`;

const PanelHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-dim);

  span {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-main);
  }
`;

// Dynamic Island Styled Component
const IslandWrapper = styled(motion.div)`
  background: #000000;
  color: #ffffff;
  border-radius: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1);
  user-select: none;
  overflow: hidden;

  [data-theme='cyberpunk'] & {
    border: 1px solid var(--neon-cyan);
    box-shadow: 0 0 15px rgba(0, 243, 255, 0.4);
  }
`;

const IslandContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

const Waveform = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  height: 16px;

  span {
    width: 3px;
    background: #22c55e;
    border-radius: 2px;
    animation: wave 0.8s ease-in-out infinite alternate;

    &:nth-child(1) { height: 60%; animation-delay: 0.1s; }
    &:nth-child(2) { height: 100%; animation-delay: 0.2s; }
    &:nth-child(3) { height: 40%; animation-delay: 0.3s; }
    &:nth-child(4) { height: 80%; animation-delay: 0.4s; }
  }

  @keyframes wave {
    0% { transform: scaleY(0.4); }
    100% { transform: scaleY(1); }
  }
`;

// Benchmark Comparison Controls
const SegmentControl = styled.div`
  display: flex;
  background: rgba(0, 0, 0, 0.06);
  padding: 3px;
  border-radius: 8px;
  margin-bottom: 16px;
  width: 100%;

  [data-theme='cyberpunk'] & {
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid var(--neon-cyan);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #e2e8f0;
  }
`;

const SegmentBtn = styled.button`
  flex: 1;
  padding: 8px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: ${props => props.$active ? 'var(--card-bg)' : 'transparent'};
  color: ${props => props.$active ? 'var(--neon-cyan)' : 'var(--text-dim)'};
  transition: all 0.2s ease;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: ${props => props.$active ? '#ffffff' : 'transparent'};
    color: ${props => props.$active ? '#2563eb' : '#64748b'};
    box-shadow: ${props => props.$active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};
  }
`;



export const IOSSandbox = () => {
  const [islandState, setIslandState] = useState('compact'); // 'compact', 'expanded', 'agent'
  const [activeArch, setActiveArch] = useState('agentic'); // 'legacy', 'agentic'

  const toggleIsland = () => {
    if (islandState === 'compact') setIslandState('expanded');
    else if (islandState === 'expanded') setIslandState('agent');
    else setIslandState('compact');
  };

  const islandVariants = {
    compact: { width: 190, height: 44, borderRadius: 22 },
    expanded: { width: 330, height: 80, borderRadius: 28 },
    agent: { width: 340, height: 110, borderRadius: 30 }
  };

  return (
    <PixelCard title="iOS Component Lab (SwiftUI & Agentic Framework)">
      <SandboxContainer>
        {/* Module 1: Fluid Dynamic Island */}
        <InteractivePanel>
          <PanelHeader>
            <span><FaApple size={16} /> Dynamic Island Physics</span>
            <span>Tap to morph</span>
          </PanelHeader>

          <IslandWrapper
            variants={islandVariants}
            animate={islandState}
            onClick={toggleIsland}
            transition={{ type: "spring", stiffness: 450, damping: 32, mass: 0.8 }}
            role="button"
            aria-label="Interactive Dynamic Island component"
          >
            <AnimatePresence mode="wait">
              {islandState === 'compact' && (
                <motion.div
                  key="compact"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
                    <FaRobot color="#22c55e" />
                    <span>Rook Online</span>
                  </div>
                  <Waveform>
                    <span /><span /><span /><span />
                  </Waveform>
                </motion.div>
              )}

              {islandState === 'expanded' && (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ width: '100%' }}
                >
                  <IslandContent>
                    <div style={{ background: '#2563eb', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaLayerGroup size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Zoho Mobile UI Kit</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Modular Swift Components</div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 'bold' }}>Reduced Time</div>
                  </IslandContent>
                </motion.div>
              )}

              {islandState === 'agent' && (
                <motion.div
                  key="agent"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{ width: '100%' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#38bdf8', fontWeight: 600 }}>
                      <FaBolt /> Agentic Component Generator
                    </div>
                    <span style={{ fontSize: '0.7rem', background: '#22c55e33', color: '#4ade80', padding: '2px 8px', borderRadius: 9999 }}>Active</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                    Automated UI generation, component contract verification & live property injection in Swift.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </IslandWrapper>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 15 }}>
            State: <strong>{islandState.toUpperCase()}</strong> (Browser physics illustration, not native SwiftUI)
          </div>
        </InteractivePanel>

        {/* Module 2: Architecture Performance Refactor Benchmark */}
        <InteractivePanel>
          <PanelHeader>
            <span><FaBolt size={14} /> Architecture Benchmark</span>
            <span>Refactor Impact</span>
          </PanelHeader>

          <SegmentControl>
            <SegmentBtn
              $active={activeArch === 'legacy'}
              onClick={() => setActiveArch('legacy')}
            >
              Legacy Architecture
            </SegmentBtn>
            <SegmentBtn
              $active={activeArch === 'agentic'}
              onClick={() => setActiveArch('agentic')}
            >
              Swift UI Kit + Agentic
            </SegmentBtn>
          </SegmentControl>

          <div style={{ fontSize: '0.78rem', lineHeight: 1.6, color: 'var(--text-dim)' }}>
            <p style={{ margin: '0 0 8px' }}>
              {activeArch === 'agentic'
                ? 'Component scaffolding from a specification through contract, test and verification steps, alongside the reusable Swift component library.'
                : 'Reusable Swift/SwiftUI/UIKit components and modular structure for existing application modules.'}
            </p>
            <p style={{ margin: 0 }}>
              Delivery-time and performance work is described qualitatively because no
              public measurement record exists. Specific timings, memory values and
              percentage improvements are therefore not shown.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#10b981', marginTop: 14 }}>
            <FaCheckCircle size={12} /> Qualitative description only — not a measured benchmark
          </div>
        </InteractivePanel>
      </SandboxContainer>
    </PixelCard>
  );
};

export default IOSSandbox;
