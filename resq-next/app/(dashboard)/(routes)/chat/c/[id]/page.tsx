import ChatHistory from "@/components/ChatUI/ChatHistory";
import { currentUser } from "@clerk/nextjs/server";


export default async function Chat() {

   const user = await currentUser();
    console.log(user?.id);
    // Create plain object with only needed properties
    const serializedUser = user
      ? {
          username: user.username,
          id: user.id,
        }
      : null;

  return (
   <ChatHistory User={serializedUser}/>
  );
}
