import { useId } from 'react';
import { FiCheck, FiChevronDown } from 'react-icons/fi';
import { projects } from '../../data/portfolio.js';
import useProjectPicker from './useProjectPicker.js';
import './project-picker.css';

const projectNames = projects.map((project) => project.name);

export default function FeaturedProjectPicker({ selectedIndex, onSelect, onTriggerHidden }) {
  const id = useId();
  const {
    open,
    activeIndex,
    pickerRef,
    triggerRef,
    listRef,
    placement,
    menuStyle,
    openPicker,
    closePicker,
    selectProject,
    handleTriggerKeyDown,
    handleListKeyDown,
    handleBlur,
    setActiveIndex,
  } = useProjectPicker({
    count: projects.length,
    selectedIndex,
    onSelect,
    labels: projectNames,
    onTriggerHidden,
  });

  return (
    <div className="showcase-mobile-picker" ref={pickerRef} onBlur={handleBlur}>
      <div className="project-picker-label">
        <span id={`${id}-label`}>Choose a project</span>
        <span className="showcase-picker-count" id={`${id}-count`}>
          {String(selectedIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
        </span>
      </div>
      <div className="project-picker-control">
        <button
          className="project-picker-trigger"
          type="button"
          ref={triggerRef}
          aria-labelledby={`${id}-label ${id}-value`}
          aria-describedby={`${id}-count`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          onClick={() => (open ? closePicker(true) : openPicker())}
          onKeyDown={handleTriggerKeyDown}
        >
          <span id={`${id}-value`}>{projects[selectedIndex].name}</span>
          <FiChevronDown aria-hidden="true" />
        </button>
        {open && (
          <div
            className="project-picker-menu"
            data-placement={placement}
            id={`${id}-list`}
            role="listbox"
            aria-label="Choose a project"
            aria-activedescendant={`${id}-option-${activeIndex}`}
            tabIndex={-1}
            ref={listRef}
            style={menuStyle}
            onKeyDown={handleListKeyDown}
          >
            {projects.map((project, index) => (
              <button
                className="project-picker-option"
                type="button"
                role="option"
                id={`${id}-option-${index}`}
                aria-selected={index === selectedIndex}
                aria-label={project.name}
                data-project-index={index}
                data-active={index === activeIndex}
                key={project.id}
                tabIndex={-1}
                onPointerMove={() => setActiveIndex(index)}
                onClick={() => selectProject(index)}
              >
                <span className="project-picker-number" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="project-picker-copy">
                  <span>{project.name}</span>
                  <small>{project.tags.slice(0, 3).join(' · ')}</small>
                </span>
                {index === selectedIndex && <FiCheck aria-hidden="true" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
