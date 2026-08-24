import { BoardScreen } from "@/components/board-screen";
import { getDataset } from "@/lib/board/datasets";

export default async function Home(props: PageProps<"/">) {
  // `?data=early` gives the nearly empty board. Anything else gives `full`.
  const { data } = await props.searchParams;
  return <BoardScreen dataset={getDataset(data)} />;
}
