import { TradingTerminal } from "@/components/trade/trading-terminal";

export default async function TradePage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  return <TradingTerminal pair={pair} />;
}
