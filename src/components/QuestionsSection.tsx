import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { preguntasService } from "@/services";
import type { Pregunta } from "@/services";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  publicacionId: number;
  sellerId: string | null;
}

const QuestionsSection = ({ publicacionId, sellerId }: Props) => {
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isSeller = user?.id === sellerId;
  const isBuyer = user && !isSeller;

  const fetchPreguntas = async () => {
    try {
      const data = await preguntasService.listByPublicacion(publicacionId);
      setPreguntas(data);
    } catch {
      // silent
    }
  };

  useEffect(() => { fetchPreguntas(); }, [publicacionId]);

  const handleAsk = async () => {
    if (!newQuestion.trim() || !user) return;
    setSubmitting(true);
    try {
      await preguntasService.create(publicacionId, user.id, newQuestion.trim());
      setNewQuestion("");
      fetchPreguntas();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleReply = async (preguntaId: string) => {
    if (!replyText.trim() || !user) return;
    setSubmitting(true);
    try {
      await preguntasService.reply(preguntaId, user.id, replyText.trim());
      setReplyingTo(null);
      setReplyText("");
      fetchPreguntas();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleDelete = async (preguntaId: string) => {
    try {
      await preguntasService.delete(preguntaId);
      fetchPreguntas();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <MessageCircle className="h-5 w-5" /> Preguntas ({preguntas.length})
      </h2>

      {isBuyer && userType === "Buyer" && (
        <div className="flex gap-2">
          <Textarea placeholder="Hacé tu pregunta al vendedor..." value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} rows={2} className="flex-1" />
          <Button onClick={handleAsk} disabled={submitting || !newQuestion.trim()} size="icon" className="shrink-0 self-end rounded-full">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!user && <p className="text-sm text-muted-foreground">Inicia sesión como comprador para hacer preguntas.</p>}

      <div className="space-y-3">
        {preguntas.map((p) => (
          <div key={p.id} className="bg-muted/50 rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium"><span className="text-primary">P:</span> {p.pregunta}</p>
              {user?.id === p.user_id && !p.respuesta && (
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              )}
            </div>
            {p.respuesta ? (
              <p className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/30">
                <span className="font-medium text-foreground">R:</span> {p.respuesta}
              </p>
            ) : isSeller ? (
              replyingTo === p.id ? (
                <div className="flex gap-2 pl-4">
                  <Textarea placeholder="Escribí tu respuesta..." value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={2} className="flex-1" />
                  <div className="flex flex-col gap-1">
                    <Button size="sm" onClick={() => handleReply(p.id)} disabled={submitting || !replyText.trim()} className="rounded-full">Enviar</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(""); }}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => { setReplyingTo(p.id); setReplyText(""); }} className="ml-4 rounded-full">Responder</Button>
              )
            ) : (
              <p className="text-xs text-muted-foreground pl-4 italic">Esperando respuesta del vendedor...</p>
            )}
          </div>
        ))}
        {preguntas.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No hay preguntas aún. ¡Sé el primero en preguntar!</p>}
      </div>
    </div>
  );
};

export default QuestionsSection;
