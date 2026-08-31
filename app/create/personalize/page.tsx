import { giftTemplates } from "@/app/data/options";
import GiftEditor from "./gift-editor";
import type { TemplatePreset } from "./builder-config";

type PersonalizePageProps = {
  searchParams: Promise<{ occasion?: string; gift?: string; recipient?: string; style?: string; template?: string }>;
};

export default async function PersonalizePage({ searchParams }: PersonalizePageProps) {
  const {
    occasion = "Just Because",
    gift = "Digital Letter",
    recipient,
    style,
    template: templateId,
  } = await searchParams;

  const selected = templateId && templateId !== "scratch"
    ? giftTemplates.find((template) => template.id === templateId && template.giftType === gift)
    : undefined;

  const template: TemplatePreset | null = selected
    ? { id: selected.id, name: selected.name, theme: selected.theme, layout: selected.layout, decoration: selected.decoration }
    : null;

  return (
    <GiftEditor
      occasion={occasion}
      gift={gift}
      recipientType={recipient}
      style={style}
      templateId={templateId}
      template={template}
    />
  );
}
