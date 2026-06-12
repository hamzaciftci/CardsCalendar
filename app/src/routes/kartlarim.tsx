import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { Card } from "@/engine";
import { useCards } from "@/hooks/use-cards";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageHeader } from "@/components/PageHeader";
import { CardTile } from "@/components/CardTile";
import { CardForm } from "@/components/CardForm";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";

export const Route = createFileRoute("/kartlarim")({
  head: () => ({
    meta: [
      { title: "Kartlarım — KartPilot" },
      {
        name: "description",
        content: "Kart adı, banka ve tarihlerinle kartlarını yönet — numara/CVV asla istemiyoruz.",
      },
      {
        property: "og:title",
        content: "Kartlarım — KartPilot",
      },
      {
        property: "og:description",
        content: "Kartlarını ekle ve düzenle. Numara, CVV, şifre yok.",
      },
    ],
  }),
  component: CardsPage,
});

function CardsPage() {
  const { cards, ready, addCard, editCard, removeCard } = useCards();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Card | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<Card | undefined>();

  if (!ready) return null;

  const openNew = () => {
    setEditing(undefined);
    setSheetOpen(true);
  };
  const openEdit = (c: Card) => {
    setEditing(c);
    setSheetOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Kartlarım"
        subtitle={`${cards.length} kart kayıtlı`}
        right={
          <Button size="sm" className="h-9 font-semibold" onClick={openNew}>
            <Plus className="mr-1 h-4 w-4" /> Kart Ekle
          </Button>
        }
      />

      <div className="animate-rise mb-5 flex items-start gap-2.5 rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-[12px] leading-snug text-success-foreground/90">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-success" />
        <p>
          Burada yalnızca kart adı, banka ve tarihler tutulur. Kart numarası, CVV ve şifre — bu
          uygulamada böyle alanlar yok.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c, i) => (
          <div key={c.id} className="animate-rise" style={{ animationDelay: `${80 + i * 60}ms` }}>
            <CardTile card={c} onClick={() => openEdit(c)} />
          </div>
        ))}
        {cards.length === 0 && (
          <div className="panel col-span-full p-8 text-center">
            <p className="text-sm text-muted-foreground">Henüz kart eklemedin.</p>
            <Button onClick={openNew} className="mt-4 font-semibold">
              İlk kartını ekle
            </Button>
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={
            isMobile
              ? "max-h-[92vh] overflow-y-auto rounded-t-3xl border-border bg-card p-0"
              : "w-full overflow-y-auto border-border bg-card p-0 sm:max-w-[460px]"
          }
        >
          <SheetHeader className="px-5 pb-2 pt-5">
            <SheetTitle className="text-xl font-bold tracking-tight">
              {editing ? "Kartı düzenle" : "Yeni kart"}
            </SheetTitle>
          </SheetHeader>
          <CardForm
            initial={editing}
            submitLabel={editing ? "Güncelle" : "Kaydet"}
            onCancel={() => setSheetOpen(false)}
            onSubmit={(c) => {
              if (editing) editCard(c);
              else addCard(c);
              setSheetOpen(false);
            }}
          />
          {editing && (
            <div className="border-t border-border px-5 pb-8 pt-4">
              <Button
                variant="ghost"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setConfirmDelete(editing)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Bu kartı sil
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kartı sil?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kartın tarihleri ve hatırlatmaları da silinir. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDelete) removeCard(confirmDelete.id);
                setConfirmDelete(undefined);
                setSheetOpen(false);
              }}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
