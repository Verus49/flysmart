import React, { useState } from "react";
import { ARCHITECTURE_NODES } from "../data/architectureDocs";
import { ArchitectureNode } from "../types";
import { 
  Network, 
  Server, 
  Cpu, 
  Zap, 
  Bot, 
  Database, 
  Radio, 
  Coins, 
  Globe, 
  Activity, 
  ChevronRight, 
  Layers, 
  ShieldCheck 
} from "lucide-react";

interface ArchitectureDiagramProps {
  onSelectNode: (node: ArchitectureNode) => void;
  selectedNode: ArchitectureNode | null;
}

export default function ArchitectureDiagram({ onSelectNode, selectedNode }: ArchitectureDiagramProps) {
  const [hoveredNode, setHoveredNode] = useState<ArchitectureNode | null>(null);

  // Connection paths: source -> target
  const connections = [
    { from: "edge", to: "apigateway", animated: true },
    { from: "apigateway", to: "searchservice", animated: false },
    { from: "apigateway", to: "pricingengine", animated: false },
    { from: "apigateway", to: "farestream", animated: false },
    { from: "apigateway", to: "assistant", animated: false },
    { from: "searchservice", to: "rediscluster", animated: true },
    { from: "pricingengine", to: "kafka", animated: true },
    { from: "farestream", to: "kafka", animated: true },
    { from: "assistant", to: "spannersync", animated: true },
    { from: "rediscluster", to: "providergds", animated: false },
    { from: "kafka", to: "bigtable", animated: true }
  ];

  const getNodeColor = (category: string) => {
    switch (category) {
      case "ingress":
        return "border-emerald-500/50 bg-emerald-950/40 text-emerald-400 shadow-emerald-950/30 hover:border-emerald-400";
      case "service":
        return "border-sky-500/50 bg-sky-950/40 text-sky-400 shadow-sky-950/30 hover:border-sky-400";
      case "storage":
        return "border-amber-500/50 bg-amber-950/40 text-amber-400 shadow-amber-950/30 hover:border-amber-400";
      case "event":
        return "border-purple-500/50 bg-purple-950/40 text-purple-400 shadow-purple-950/30 hover:border-purple-400";
      case "external":
        return "border-rose-500/50 bg-rose-950/40 text-rose-400 shadow-rose-950/30 hover:border-rose-400";
      default:
        return "border-slate-500/50 bg-slate-900 text-slate-400 hover:border-slate-400";
    }
  };

  const getNodeIcon = (id: string, category: string) => {
    switch (id) {
      case "edge": return <Globe className="w-5 h-5" />;
      case "apigateway": return <Network className="w-5 h-5" />;
      case "searchservice": return <Server className="w-5 h-5" />;
      case "pricingengine": return <Cpu className="w-5 h-5" />;
      case "farestream": return <Zap className="w-5 h-5" />;
      case "assistant": return <Bot className="w-5 h-5" />;
      case "rediscluster": return <Layers className="w-5 h-5" />;
      case "kafka": return <Radio className="w-5 h-5" />;
      case "spannersync": return <Coins className="w-5 h-5" />;
      case "providergds": return <Globe className="w-5 h-5" />;
      case "bigtable": return <Database className="w-5 h-5" />;
      default: return <Server className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[620px]">
      {/* SVG Canvas Map */}
      <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 relative overflow-auto backdrop-blur-sm min-h-[500px]">
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-full font-mono">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Ingress / Edge
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-950/40 border border-sky-500/30 text-sky-400 rounded-full font-mono">
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"></span> Core Service
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/40 border border-purple-500/30 text-purple-400 rounded-full font-mono">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></span> Event Stream
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/40 border border-amber-500/30 text-amber-400 rounded-full font-mono">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span> Storage Tier
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-950/40 border border-rose-500/30 text-rose-400 rounded-full font-mono">
            <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></span> External API
          </span>
        </div>

        <div className="absolute top-4 right-4 z-10 text-[10px] text-slate-500 font-mono hidden sm:block">
          *Click node to deep-dive architecture specs
        </div>

        {/* Dynamic Interactive SVG Connections */}
        <div className="w-[800px] h-[560px] mx-auto relative">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: "800px", minHeight: "560px" }}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
              </marker>
              <marker id="arrow-glow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
              </marker>
              <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {connections.map((conn, idx) => {
              const fromNode = ARCHITECTURE_NODES.find(n => n.id === conn.from);
              const toNode = ARCHITECTURE_NODES.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              const isHighlighted = 
                (selectedNode && (selectedNode.id === fromNode.id || selectedNode.id === toNode.id)) ||
                (hoveredNode && (hoveredNode.id === fromNode.id || hoveredNode.id === toNode.id));

              return (
                <g key={idx}>
                  {/* Background Path Line */}
                  <path
                    d={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`}
                    stroke={isHighlighted ? "#38bdf8" : "#334155"}
                    strokeWidth={isHighlighted ? "2.5" : "1.5"}
                    markerEnd={`url(#${isHighlighted ? "arrow-glow" : "arrow"})`}
                    className="transition-all duration-300"
                  />
                  {/* Pulsing glow particle for animated connection paths */}
                  {conn.animated && (
                    <circle r="4" fill="#38bdf8" className="filter drop-shadow-[0_0_8px_#38bdf8]">
                      <animateMotion
                        dur="4s"
                        repeatCount="indefinite"
                        path={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`}
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive HTML Node Blocks Overlay */}
          {ARCHITECTURE_NODES.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const isHovered = hoveredNode?.id === node.id;
            const cardStyles = getNodeColor(node.category);

            return (
              <button
                key={node.id}
                id={`node-${node.id}`}
                onClick={() => onSelectNode(node)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{
                  position: "absolute",
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  transform: "translate(-50%, -50%)",
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium tracking-wide shadow-lg transition-all duration-300 z-20 cursor-pointer text-left min-w-[170px] ${cardStyles} ${
                  isSelected ? "ring-2 ring-sky-400/80 scale-105 filter drop-shadow-[0_0_12px_rgba(56,189,248,0.3)] border-sky-400" : ""
                } ${isHovered ? "scale-102" : ""}`}
              >
                <div className="shrink-0">
                  {getNodeIcon(node.id, node.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-100 leading-tight truncate">{node.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate font-mono">{node.techStack.split(" / ")[0]}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side Detail Inspector Panel */}
      <div className="w-full xl:w-[350px] flex flex-col justify-between bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl shrink-0">
        {selectedNode ? (
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className={`inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-semibold ${
                    selectedNode.category === "ingress" ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30" :
                    selectedNode.category === "service" ? "bg-sky-950 text-sky-400 border border-sky-500/30" :
                    selectedNode.category === "storage" ? "bg-amber-950 text-amber-400 border border-amber-500/30" :
                    selectedNode.category === "event" ? "bg-purple-950 text-purple-400 border border-purple-500/30" :
                    "bg-rose-950 text-rose-400 border border-rose-500/30"
                  }`}>
                    {selectedNode.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 mt-1.5">{selectedNode.label}</h3>
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-4 text-xs">
                <div>
                  <div className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">Description</div>
                  <p className="text-slate-300 mt-1 leading-relaxed">{selectedNode.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/50">
                  <div>
                    <div className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">Tech Stack</div>
                    <div className="text-slate-200 font-medium mt-0.5">{selectedNode.techStack}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">Latency SLA</div>
                    <div className="text-sky-400 font-semibold font-mono mt-0.5">{selectedNode.latencySLA}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/50">
                  <div className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">Scaling Throughput</div>
                  <div className="text-emerald-400 font-semibold mt-0.5 font-mono">{selectedNode.scaleCapacity}</div>
                </div>

                <div className="pt-3 border-t border-slate-800/50">
                  <div className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">Failover Plan</div>
                  <div className="text-slate-300 mt-0.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{selectedNode.failoverPlan}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed font-mono">
              *Designed for global multi-region active-active deployment to eliminate single points of failure.
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20 h-full">
            <div className="w-12 h-12 bg-slate-800/40 rounded-xl flex items-center justify-center text-slate-500 mb-4 border border-slate-800 animate-pulse">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-300">No Component Selected</h3>
            <p className="text-xs text-slate-500 max-w-[220px] mt-1.5 leading-relaxed">
              Click on any structural element inside the high-level architecture diagram to inspect its deep-dive parameters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
