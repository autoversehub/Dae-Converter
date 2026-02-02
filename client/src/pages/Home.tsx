import { Header } from "@/components/Header";
import { Dropzone } from "@/components/Dropzone";
import { ConversionList } from "@/components/ConversionList";
import { useUploadConversion } from "@/hooks/use-conversions";
import { ArrowDown, Cpu, Zap, Layers } from "lucide-react";

export default function Home() {
  const uploadMutation = useUploadConversion();

  return (
    <div className="min-h-screen bg-background text-foreground font-body selection:bg-primary/20">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/10 blur-[100px] -z-10 rounded-full pointer-events-none" />
          
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight">
            BEAMNG <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">MODEL</span> CONVERTER
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Transform your BeamNG vehicle models (.DAE) into universal formats like FBX and OBJ. 
            Optimized for Blender and Roblox imports with texture preservation.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mb-12 text-sm font-mono text-muted-foreground">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              <span>FAST PROCESSING</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>TEXTURE PRESERVATION</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>OPTIMIZED GEOMETRY</span>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section className="relative z-10 mb-20">
          <Dropzone 
            onUpload={(file, format) => uploadMutation.mutate({ file, targetFormat: format })}
            isUploading={uploadMutation.isPending}
          />
          
          <div className="flex justify-center mb-12">
            <ArrowDown className="w-6 h-6 text-muted-foreground/30 animate-bounce" />
          </div>
        </section>

        {/* List Section */}
        <section className="max-w-4xl mx-auto">
          <ConversionList />
        </section>
      </main>

      <footer className="border-t border-border mt-20 py-8 bg-card/30">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground font-mono">
          <p>&copy; {new Date().getFullYear()} BEAM2MESH CONVERTER SYSTEM. ALL RIGHTS RESERVED.</p>
          <p className="mt-2 opacity-50">NOT AFFILIATED WITH BEAMNG GMBH.</p>
        </div>
      </footer>
    </div>
  );
}
