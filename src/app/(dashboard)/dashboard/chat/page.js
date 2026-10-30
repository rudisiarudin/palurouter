import BasicChatPageClient from "../basic-chat/BasicChatPageClient";

export const metadata = {
  title: "Model Playground - PALU Router",
  description: "Test and compare AI models directly in your browser",
};

export default function ChatPlaygroundPage() {
  return <BasicChatPageClient />;
}
