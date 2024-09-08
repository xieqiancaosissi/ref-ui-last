import { useEffect, useState } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [clientReady, setClientReady] = useState<boolean>(false);
  useEffect(() => {
    setClientReady(true);
  }, []);
  if (clientReady) return <>{children}</>;
  return null;
}
