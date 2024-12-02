import { useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-100">
      <div className="flex flex-col items-center justify-center max-w-2xl p-16 text-center bg-white rounded-lg shadow-lg">
        <h3 className="mb-4 text-slate-800">Welcome to Your Notes App</h3>
        <p className="mb-6 text-lg text-slate-600">
          Stay organized and manage your notes efficiently with our easy-to-use
          app.
        </p>

        <Button size="lg" onClick={() => navigate("/notes")}>
          Go to Notes
        </Button>
      </div>
    </main>
  );
};

export default Home;
