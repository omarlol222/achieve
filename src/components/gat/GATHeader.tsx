import { Link } from "react-router-dom";

export const GATHeader = () => (
  <div className="flex items-center justify-center mb-8">
    <Link to="/gat" className="text-3xl font-bold hover:text-gray-700 transition-colors">
      GAT
    </Link>
  </div>
);