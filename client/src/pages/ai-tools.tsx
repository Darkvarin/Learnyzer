import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getAIToolIcon } from "@/lib/utils";
import { AITool } from "@shared/types";
import { Link } from "wouter";

export default function AiTools() {
  const { data: tools, isLoading } = useQuery<AITool[]>({
    queryKey: ['/api/ai/tools'],
  });

  return (
    <div className="min-h-screen flex flex-col bg-dark text-white">
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-gaming">AI Tools</h1>
          <p className="text-gray-400 mt-1">Powerful AI tools to enhance your learning experience</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
                <div className="p-5">
                  <Skeleton className="w-12 h-12 rounded-lg mb-3" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="border-t border-dark-border p-4">
                  <Skeleton className="h-9 w-full rounded" />
                </div>
              </div>
            ))
          ) : tools && tools.length > 0 ? (
            tools.map((tool) => (
              <div key={tool.id} className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
                <div className="p-5">
                  <div className={`w-12 h-12 bg-${tool.color}-600/20 rounded-lg flex items-center justify-center mb-4`}>
                    <i className={`${getAIToolIcon(tool.name)} text-${tool.color}-400 text-2xl`}></i>
                  </div>
                  <h2 className="text-lg font-bold mb-2">{tool.name}</h2>
                  <p className="text-sm text-gray-400">{tool.description}</p>
                  
                  {tool.features && (
                    <ul className="mt-3 space-y-1">
                      {tool.features.map((feature, idx) => (
                        <li key={idx} className="text-xs text-gray-400 flex items-start">
                          <i className="ri-checkbox-circle-line text-success-400 mr-1.5 mt-0.5"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="border-t border-dark-border p-4">
                  <Link href={`/ai-tools/${tool.id}`}>
                    <a className={`block w-full py-2 px-4 text-center rounded-md bg-${tool.color}-600 hover:bg-${tool.color}-500 text-white transition-colors`}>
                      Use Tool
                    </a>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-400">
              <i className="ri-robot-line text-5xl mb-3"></i>
              <p className="text-lg">No AI tools available yet</p>
              <p className="text-sm mt-2">Check back soon for new tools!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
