import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  userId: string;
  onImagesUploaded: (urls: string[]) => void;
  existingUrls?: string[];
}

const ImageUpload = ({ userId, onImagesUploaded, existingUrls = [] }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [urls, setUrls] = useState<string[]>(existingUrls);
  const { toast } = useToast();

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("vehiculos").upload(path, file);
      if (error) {
        toast({ title: "Error subiendo imagen", description: error.message, variant: "destructive" });
        continue;
      }
      const { data: urlData } = supabase.storage.from("vehiculos").getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
    }

    const updated = [...urls, ...newUrls];
    setUrls(updated);
    onImagesUploaded(updated);
    setUploading(false);
  }, [urls, userId, onImagesUploaded, toast]);

  const removeImage = (index: number) => {
    const updated = urls.filter((_, i) => i !== index);
    setUrls(updated);
    onImagesUploaded(updated);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {urls.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-muted group ring-2 ring-primary/20">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <ImagePlus className="h-6 w-6 text-muted-foreground" />}
          <span className="text-xs text-muted-foreground mt-1">{uploading ? "Subiendo..." : "Agregar"}</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
    </div>
  );
};

export default ImageUpload;
