import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileType, Check, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface DropzoneProps {
  onUpload: (file: File, format: "fbx" | "obj") => void;
  isUploading: boolean;
}

export function Dropzone({ onUpload, isUploading }: DropzoneProps) {
  const [targetFormat, setTargetFormat] = useState<"fbx" | "obj">("fbx");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'model/vnd.collada+xml': ['.dae'],
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile, targetFormat);
      setSelectedFile(null); // Clear after upload starts
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-12">
      <div 
        {...getRootProps()}
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 ease-out p-8 md:p-12 text-center",
          isDragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-card/50",
          isDragReject && "border-destructive bg-destructive/5",
          selectedFile ? "border-primary border-solid bg-card" : "bg-card/30"
        )}
      >
        <input {...getInputProps()} />
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative z-10 flex flex-col items-center justify-center gap-6">
          <AnimatePresence mode="wait">
            {!selectedFile ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center"
              >
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300",
                  isDragActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-secondary text-muted-foreground group-hover:text-primary group-hover:bg-secondary/80"
                )}>
                  <Upload className="w-10 h-10" />
                </div>
                
                <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                  {isDragActive ? "DROP FILE TO UPLOAD" : "DRAG & DROP OR CLICK"}
                </h3>
                <p className="text-muted-foreground font-mono text-sm max-w-sm mx-auto">
                  Supports BeamNG models (.DAE) or archives (.ZIP) containing textures.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="selected"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md"
              >
                <div className="flex items-center gap-4 bg-secondary/50 p-4 rounded-lg border border-border mb-6">
                  <div className="bg-primary/20 p-2 rounded">
                    <FileType className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-mono text-sm text-foreground truncate font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button 
                    onClick={handleClear}
                    className="p-2 hover:bg-destructive/20 hover:text-destructive rounded-full transition-colors text-muted-foreground"
                  >
                    <AlertCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full" onClick={e => e.stopPropagation()}>
                  <div className="flex-1">
                    <Select value={targetFormat} onValueChange={(v: any) => setTargetFormat(v)}>
                      <SelectTrigger className="w-full bg-background border-border h-12">
                        <SelectValue placeholder="Target Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fbx">Convert to FBX</SelectItem>
                        <SelectItem value="obj">Convert to OBJ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="flex-1 h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        UPLOADING...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        START CONVERSION
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
