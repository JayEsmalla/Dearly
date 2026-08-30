import GiftEditor from "./gift-editor";

type PersonalizePageProps = {
  searchParams: Promise<{ occasion?: string; gift?: string }>;
};

export default async function PersonalizePage({ searchParams }: PersonalizePageProps) {
  const { occasion = "Just Because", gift = "Digital Letter" } = await searchParams;
  return <GiftEditor occasion={occasion} gift={gift} />;
}

