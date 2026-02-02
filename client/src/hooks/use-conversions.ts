import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useConversions() {
  return useQuery({
    queryKey: [api.conversions.list.path],
    queryFn: async () => {
      const res = await fetch(api.conversions.list.path);
      if (!res.ok) throw new Error("Failed to fetch conversions");
      return api.conversions.list.responses[200].parse(await res.json());
    },
    refetchInterval: 3000, // Poll every 3 seconds for status updates
  });
}

export function useConversion(id: number) {
  return useQuery({
    queryKey: [api.conversions.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.conversions.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch conversion details");
      return api.conversions.get.responses[200].parse(await res.json());
    },
  });
}

export function useUploadConversion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, targetFormat }: { file: File; targetFormat: 'fbx' | 'obj' }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetFormat", targetFormat);

      const res = await fetch(api.conversions.upload.path, {
        method: "POST",
        body: formData, // Browser handles Content-Type for FormData
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Invalid upload");
        }
        throw new Error("Upload failed");
      }
      return api.conversions.upload.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.conversions.list.path] });
      toast({
        title: "Upload Started",
        description: "Your file is being uploaded and queued for conversion.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function getDownloadUrl(id: number): string {
  return buildUrl(api.conversions.download.path, { id });
}
