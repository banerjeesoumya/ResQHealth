import { currentUser } from "@clerk/nextjs/server";
import ChatClient from "@/components/ChatUI/ChatClient";

const ChatPage = async () => {
  const user = await currentUser();
  console.log(user?.id);
  // Create plain object with only needed properties
  const serializedUser = user
    ? {
        username: user.username,
        id: user.id,
      }
    : null;

  return <ChatClient user={serializedUser} />;
};

export default ChatPage;
