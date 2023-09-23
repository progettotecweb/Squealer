import React from "react";

//components
import PageContainer from "@/components/PageContainer";

// #TODO-gianlo: move header and footer to be rendered outside of the pages, so they will share the same structure
const Homepage: React.FC = () => {
  return (
    <PageContainer>
      <h1 className="text-3xl font-bold mb-4 text-slate-50">
        Welcome to Squealer!
      </h1>
      <p className="text-lg text-slate-50 mb-8">
        The best place to share your thoughts and ideas.
      </p>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Get Started
      </button>
    </PageContainer>
  );
};

export default Homepage;
