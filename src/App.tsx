import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const Home = lazy(() => import("pages/Home"));
const Notes = lazy(() => import("pages/Notes"));
import NoMatch from "pages/NoMatch";
import SpinnerOverlay from "components/SpinnerOverlay";
import ErrorBoundary from "./components/ErrorBoundary";

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="notes"
            element={
              <Suspense fallback={<SpinnerOverlay />}>
                <Notes />
              </Suspense>
            }
          />
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
