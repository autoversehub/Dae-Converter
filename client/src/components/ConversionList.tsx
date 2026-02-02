import { useConversions, getDownloadUrl } from "@/hooks/use-conversions";
import { formatDistanceToNow } from "date-fns";
import { Download, AlertCircle, Clock, CheckCircle, FileBox, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function ConversionList() {
  const { data: conversions, isLoading, error } = useConversions();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="font-mono text-sm">LOADING CONVERSIONS...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <h3 className="font-bold text-destructive">Failed to load history</h3>
        <p className="text-sm text-destructive/80 mt-1">Could not fetch recent conversions.</p>
      </div>
    );
  }

  if (!conversions || conversions.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/30">
        <FileBox className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground">No conversions yet</h3>
        <p className="text-sm text-muted-foreground mt-1">Upload a file to start converting</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Recent Conversions
        </h2>
        <span className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
          {conversions.length} ITEMS
        </span>
      </div>

      <div className="grid gap-4">
        {conversions.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-card hover:bg-card/80 border border-border hover:border-primary/30 rounded-lg p-4 transition-all duration-200"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Icon & Name */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className={cn(
                  "w-10 h-10 rounded flex items-center justify-center shrink-0 font-bold text-xs uppercase",
                  item.targetFormat === 'fbx' ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                )}>
                  {item.targetFormat}
                </div>
                <div className="min-w-0">
                  <h4 className="font-mono text-sm font-medium text-foreground truncate" title={item.originalName}>
                    {item.originalName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                      {formatDistanceToNow(new Date(item.createdAt || Date.now()), { addSuffix: true })}
                    </span>
                    {item.fileSize && (
                      <span className="text-[10px] font-mono text-muted-foreground">
                        • {(item.fileSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-4 justify-between md:justify-end min-w-[200px]">
                <StatusBadge status={item.status} message={item.message} />
                
                {item.status === 'completed' ? (
                  <Button 
                    size="sm" 
                    className="h-9 px-4 font-semibold shadow-none bg-primary hover:bg-primary/90 text-primary-foreground"
                    asChild
                  >
                    <a href={getDownloadUrl(item.id)} download>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </a>
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" disabled className="h-9 px-4 opacity-0">
                    placeholder
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status, message }: { status: string; message: string | null }) {
  const styles = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
    failed: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const icons = {
    pending: <Clock className="w-3.5 h-3.5" />,
    processing: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    completed: <CheckCircle className="w-3.5 h-3.5" />,
    failed: <AlertCircle className="w-3.5 h-3.5" />,
  };

  const style = styles[status as keyof typeof styles] || styles.pending;
  const icon = icons[status as keyof typeof icons] || icons.pending;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider",
        style
      )}>
        {icon}
        <span>{status}</span>
      </div>
      {status === 'failed' && message && (
        <span className="text-[10px] text-destructive max-w-[150px] truncate text-right" title={message}>
          {message}
        </span>
      )}
    </div>
  );
}
