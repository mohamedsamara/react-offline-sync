import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const Home = lazy(() => import("pages/Home"));
const Notes = lazy(() => import("pages/Notes"));
import NoMatch from "pages/NoMatch";
import SpinnerOverlay from "components/SpinnerOverlay";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
};

export default App;
