import { currentUser } from "@clerk/nextjs/server";
import React from "react";
import HealthCenter from "@/components/NearbyCenters";

const Page = async () => {
  
  const user = await currentUser();
  return (
   <HealthCenter/>
  );
};

export default Page;
