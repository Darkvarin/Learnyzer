import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, MousePointer, BookOpen, Target } from 'lucide-react';

interface SVGElement {
  id: string;
  type: 'circle' | 'rectangle' | 'arrow' | 'text' | 'line';
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  radius?: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  label?: string;
  content?: string;
  fontSize?: number;
  fontWeight?: string;
  textAnchor?: string;
  clickable?: boolean;
  tooltip?: string;
  explanation?: string;
  animated?: boolean;
}

interface Interaction {
  elementId: string;
  action: 'click' | 'hover';
  response: string;
}

interface DiagramData {
  title: string;
  description: string;
  type: string;
  hasVisual: boolean;
  interactionType?: string;
  svgElements?: SVGElement[];
  interactions?: Interaction[];
  learningObjectives?: string[];
  examRelevance?: string;
  studySteps?: string[];
  examTips?: string[];
  nextSteps?: string;
}

interface InteractiveDiagramProps {
  data: DiagramData;
}

export function InteractiveDiagram({ data }: InteractiveDiagramProps) {
  const [selectedElement, setSelectedElement] = useState<SVGElement | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  // If it's not an interactive SVG, show study guide
  if (data.type === 'study_guide') {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-dark-card border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BookOpen className="h-5 w-5 text-blue-400" />
            {data.title}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {data.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.studySteps && (
            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-400" />
                Study Steps
              </h4>
              <ul className="space-y-2">
                {data.studySteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {data.examTips && (
            <div>
              <h4 className="font-semibold text-white mb-2">Exam Tips</h4>
              <ul className="space-y-1">
                {data.examTips.map((tip, index) => (
                  <li key={index} className="text-gray-300 text-sm">• {tip}</li>
                ))}
              </ul>
            </div>
          )}
          
          {data.nextSteps && (
            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
              <p className="text-blue-300 text-sm"><strong>Next:</strong> {data.nextSteps}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Interactive SVG diagram
  const handleElementClick = (element: SVGElement) => {
    if (element.clickable && element.explanation) {
      setSelectedElement(element);
      setShowExplanation(true);
    }
  };

  const handleElementHover = (elementId: string | null) => {
    setHoveredElement(elementId);
  };

  const renderSVGElement = (element: SVGElement) => {
    const isHovered = hoveredElement === element.id;
    const hoverStyle = isHovered ? { filter: 'brightness(1.2)', cursor: 'pointer' } : {};

    switch (element.type) {
      case 'circle':
        return (
          <g key={element.id}>
            <circle
              cx={element.x}
              cy={element.y}
              r={element.radius}
              fill={element.fill}
              stroke={element.stroke}
              strokeWidth={element.strokeWidth}
              style={hoverStyle}
              onClick={() => handleElementClick(element)}
              onMouseEnter={() => handleElementHover(element.id)}
              onMouseLeave={() => handleElementHover(null)}
            />
            {element.label && (
              <text
                x={element.x}
                y={element.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {element.label}
              </text>
            )}
          </g>
        );

      case 'rectangle':
        return (
          <g key={element.id}>
            <rect
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              fill={element.fill}
              stroke={element.stroke}
              strokeWidth={element.strokeWidth}
              rx="4"
              style={hoverStyle}
              onClick={() => handleElementClick(element)}
              onMouseEnter={() => handleElementHover(element.id)}
              onMouseLeave={() => handleElementHover(null)}
            />
            {element.label && (
              <text
                x={(element.x || 0) + (element.width || 0) / 2}
                y={(element.y || 0) + (element.height || 0) / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {element.label}
              </text>
            )}
          </g>
        );

      case 'arrow':
        const arrowLength = Math.sqrt(
          Math.pow((element.x2 || 0) - (element.x1 || 0), 2) +
          Math.pow((element.y2 || 0) - (element.y1 || 0), 2)
        );
        const angle = Math.atan2(
          (element.y2 || 0) - (element.y1 || 0),
          (element.x2 || 0) - (element.x1 || 0)
        );
        
        return (
          <g key={element.id}>
            <line
              x1={element.x1}
              y1={element.y1}
              x2={element.x2}
              y2={element.y2}
              stroke={element.stroke}
              strokeWidth={element.strokeWidth}
              markerEnd="url(#arrowhead)"
              className={element.animated ? 'animate-pulse' : ''}
            />
            {element.label && (
              <text
                x={((element.x1 || 0) + (element.x2 || 0)) / 2}
                y={((element.y1 || 0) + (element.y2 || 0)) / 2 - 10}
                textAnchor="middle"
                fill="#FF9800"
                fontSize="10"
                fontWeight="bold"
              >
                {element.label}
              </text>
            )}
          </g>
        );

      case 'text':
        return (
          <text
            key={element.id}
            x={element.x}
            y={element.y}
            fontSize={element.fontSize}
            fontWeight={element.fontWeight}
            fill={element.fill}
            textAnchor={element.textAnchor}
          >
            {element.content}
          </text>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card className="bg-dark-card border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Eye className="h-5 w-5 text-purple-400" />
            {data.title}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {data.description}
          </CardDescription>
          {data.interactionType && (
            <Badge variant="outline" className="w-fit text-purple-400 border-purple-400">
              <MousePointer className="h-3 w-3 mr-1" />
              {data.interactionType.replace('_', ' ')}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {data.svgElements && (
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <svg viewBox="0 0 600 400" className="w-full h-auto border border-gray-600 rounded">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#FF9800"
                    />
                  </marker>
                </defs>
                {data.svgElements.map(renderSVGElement)}
              </svg>
            </div>
          )}
          
          {data.learningObjectives && (
            <div className="space-y-2">
              <h4 className="font-semibold text-white">Learning Objectives</h4>
              <ul className="space-y-1">
                {data.learningObjectives.map((objective, index) => (
                  <li key={index} className="text-gray-300 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {data.examRelevance && (
            <div className="mt-4 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
              <p className="text-blue-300 text-sm">
                <strong>Exam Relevance:</strong> {data.examRelevance}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Explanation Dialog */}
      <Dialog open={showExplanation} onOpenChange={setShowExplanation}>
        <DialogContent className="bg-dark-card border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedElement?.label || 'Element Details'}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {selectedElement?.tooltip}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-300">{selectedElement?.explanation}</p>
          </div>
          <Button 
            onClick={() => setShowExplanation(false)}
            className="w-full"
          >
            Got it!
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}