import ApplicationError from './ApplicationError.jsx';
import ErrorBoundary from '../shared/ui/ErrorBoundary.jsx';
import { ThemeProvider } from '../shared/theme/ThemeProvider.jsx';
import { MotionProvider } from '../shared/motion/MotionProvider.jsx';

export default function AppProviders({ children }) {
  return (
    <ErrorBoundary fallback={<ApplicationError />}>
      <ThemeProvider>
        <MotionProvider>{children}</MotionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
