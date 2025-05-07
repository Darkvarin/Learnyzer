import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getAIToolIcon, getSafeColor } from "@/lib/utils";
import { AITool } from "@shared/types";
import { 
  BookText, 
  FileCheck, 
  Flashlight, 
  BrainCircuit, 
  Zap 
} from "lucide-react";

export function AiToolsSection() {
  const { data: tools, isLoading } = useQuery<AITool[]>({
    queryKey: ['/api/ai/tools'],
  });

  return (
    <div className="bg-dark-surface rounded-xl overflow-hidden border border-dark-border">
      <div className="p-6">
        <h2 className="text-xl font-bold font-gaming mb-4">AI Tools</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-dark-card border border-dark-border rounded-lg p-3">
                <Skeleton className="w-10 h-10 rounded-lg mb-2" />
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))
          ) : tools && tools.length > 0 ? (
            tools.slice(0, 4).map((tool) => (
              <Link key={tool.id} href={`/ai-tools/${tool.id}`}>
                <a className="bg-dark-card hover:bg-dark-hover border border-dark-border rounded-lg p-3 transition-colors cursor-pointer">
                  <div className={`w-10 h-10 bg-${getSafeColor(tool.color)}-600/20 rounded-lg flex items-center justify-center mb-2`}>
                    {tool.name.toLowerCase().includes('notes') ? (
                      <BookText className={`text-${getSafeColor(tool.color)}-400 h-5 w-5`} />
                    ) : tool.name.toLowerCase().includes('check') ? (
                      <FileCheck className={`text-${getSafeColor(tool.color)}-400 h-5 w-5`} />
                    ) : tool.name.toLowerCase().includes('flash') ? (
                      <Flashlight className={`text-${getSafeColor(tool.color)}-400 h-5 w-5`} />
                    ) : tool.name.toLowerCase().includes('performance') || tool.name.toLowerCase().includes('insight') ? (
                      <BrainCircuit className={`text-${getSafeColor(tool.color)}-400 h-5 w-5`} />
                    ) : (
                      <Zap className={`text-${getSafeColor(tool.color)}-400 h-5 w-5`} />
                    )}
                  </div>
                  <h3 className="font-bold text-sm">{tool.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{tool.description}</p>
                </a>
              </Link>
            ))
          ) : (
            <div className="col-span-2 text-center py-6 text-gray-400">
              <div className="flex justify-center mb-2">
                <Zap className="h-8 w-8 opacity-50" />
              </div>
              <p>No AI tools available</p>
            </div>
          )}
        </div>
        
        <Link href="/ai-tools">
          <a>
            <Button
              variant="outline"
              className="w-full mt-4 bg-dark-card hover:bg-dark-hover border border-dark-border text-sm py-2 rounded transition-colors flex items-center justify-center"
            >
              View All Tools
              <Zap className="ml-1 h-4 w-4" />
            </Button>
          </a>
        </Link>
      </div>
    </div>
  );
}
