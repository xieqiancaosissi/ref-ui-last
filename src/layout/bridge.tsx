import BridgeFormProvider from "@/pages/bridge/providers/bridgeForm";
import BridgeTransactionProvider from "@/pages/bridge/providers/bridgeTransaction";
import { WalletConnectProvider } from "@/pages/bridge/providers/walletConcent";

export default function BridgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bridge-page">
      <WalletConnectProvider>
        <BridgeTransactionProvider>
          <BridgeFormProvider>
            <>{children}</>
          </BridgeFormProvider>
        </BridgeTransactionProvider>
      </WalletConnectProvider>
    </div>
  );
}
