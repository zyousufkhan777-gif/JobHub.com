
import React from "react";
import HeroJob from "../components/JobsComponents/HeroJob";
import Joblist from "../components/JobsComponents/Joblist";

const Jobs = () => {
  return (
    <div className="min-h-screen">
      <HeroJob />
      <Joblist />
    </div>
  );
};

export default Jobs;
