import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { Card } from "@/engine";
import { useCards } from "@/hooks/use-cards";
import { PageHeader } from "@/components/PageHeader";
import { CardTile } from "@/components/CardTile";
import { CardForm } from "@/components/CardForm";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/kartlarim")({
  head: () => ({
    meta: [
      { title: "Kartlarım — KartPilot" },
      { name: "description", content: "Kart adı, banka ve tarihlerinle kartlarını yönet — numara/CVV asla istemiyoruz." },
      { property: "og:title", content: "Kartlarım — KartPilot" },
      { property: "og:description", content: "Kartlarını ekle ve düzenle. Numara, CVV, şifre yok." },
    ],
  }),
  component: CardsPage,
});

function CardsPage() {
  const { cards, ready, addCard, editCard, removeCard } = useCards();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Card | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<Card | undefined>();

  if (!ready) return null;

  const openNew = () => { setEditing(undefined); setSheetOpen(true); };
  const openEdit = (c: Card) => { setEditing(c); setSheetOpen(true); };

  return (
    <div className="pb-8">
      <PageHeader
        title="Kartlarım"
        subtitle={`${cards.length} kart kayıtlı`}
        right={
          <Button size="sm" onClick={openNew}>
            <Plus className="mr-1 h-4 w-4" /> Ekle
          </Button>
        }
      />

      <div className="mx-5 space-y-3">
        {cards.map((c) => (
          <CardTile key={c.id} card={c} onClick={() => openEdit(c)} />
        ))}
        {cards.length === 0 && (
          <div className="rounded-2xl bg-surface p-6 text-center shadow-soft">
            <p className="text-sm text-muted-foreground">Henüz kart eklemedin.</p>
            <Button onClick={openNew} className="mt-4">İlk kartını ekle</Button>
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-3xl p-0">
          <SheetHeader className="px-5 pb-2 pt-5">
            <SheetTitle>{editing ? "Kartı düzenle" : "Yeni kart"}</SheetTitle>
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
