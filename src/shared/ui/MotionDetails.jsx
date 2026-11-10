import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useSiteMotion } from '../motion/useSiteMotion.js';
import useDisclosureMotion from '../motion/useDisclosureMotion.js';

const MotionDetails = forwardRef(function MotionDetails(
  { children, open, onClick, motionEnabled, ...props },
  forwardedRef,
) {
  const details = useRef(null);
  const { enabled: siteEnabled } = useSiteMotion();
  const click = useDisclosureMotion(details, siteEnabled && motionEnabled !== false, open);
  useImperativeHandle(forwardedRef, () => details.current);
  return (
    <details
      {...props}
      ref={details}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) click(event);
      }}
    >
      {children}
    </details>
  );
});

export default MotionDetails;
