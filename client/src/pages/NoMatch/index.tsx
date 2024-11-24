import { useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";

const NoMatch = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center h-full">
      <div className="flex flex-col justify-center items-center space-y-6">
        <h4 className="font-bold text-xl">Page not found</h4>
        <p className="text-slate-600">
          Sorry, we could not find the page you are looking for.
        </p>
        <Button onClick={() => navigate("/")}>Go to Home</Button>
      </div>
    </div>
  );
};

export default NoMatch;
