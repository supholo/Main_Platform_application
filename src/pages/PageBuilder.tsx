import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Layout, Type, Image, Box, List, Link as LinkIcon } from 'lucide-react';

interface ComponentBlock {
  id: string;
  type: 'heading' | 'text' | 'image' | 'container' | 'list' | 'link';
  content: string;
  settings?: {
    size?: string;
    align?: string;
    style?: string;
  };
}

const PageBuilder: React.FC = () => {
  const [blocks, setBlocks] = useState<ComponentBlock[]>([
    { id: '1', type: 'heading', content: 'Welcome to Page Builder', settings: { size: 'h1' } },
    { id: '2', type: 'text', content: 'Start building your page by dragging components from the sidebar.' },
  ]);

  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const componentTypes = [
    { type: 'heading', icon: <Type className="h-5 w-5" />, label: 'Heading' },
    { type: 'text', icon: <Layout className="h-5 w-5" />, label: 'Text Block' },
    { type: 'image', icon: <Image className="h-5 w-5" />, label: 'Image' },
    { type: 'container', icon: <Box className="h-5 w-5" />, label: 'Container' },
    { type: 'list', icon: <List className="h-5 w-5" />, label: 'List' },
    { type: 'link', icon: <LinkIcon className="h-5 w-5" />, label: 'Link' },
  ];

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBlocks(items);
  };

  const addNewBlock = (type: ComponentBlock['type']) => {
    const newBlock: ComponentBlock = {
      id: Date.now().toString(),
      type,
      content: `New ${type} component`,
      settings: { size: type === 'heading' ? 'h2' : undefined },
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(blocks.map(block =>
      block.id === id ? { ...block, content } : block
    ));
  };

  const renderBlock = (block: ComponentBlock) => {
    const isSelected = selectedBlock === block.id;

    switch (block.type) {
      case 'heading':
        return (
          <div className={`p-4 ${isSelected ? 'ring-2 ring-primary' : ''}`}>
            <input
              type="text"
              value={block.content}
              onChange={(e) => updateBlockContent(block.id, e.target.value)}
              className="w-full text-2xl font-bold border-none focus:ring-0 bg-transparent"
            />
          </div>
        );
      case 'text':
        return (
          <div className={`p-4 ${isSelected ? 'ring-2 ring-primary' : ''}`}>
            <textarea
              value={block.content}
              onChange={(e) => updateBlockContent(block.id, e.target.value)}
              className="w-full min-h-[100px] border-none focus:ring-0 bg-transparent resize-y"
            />
          </div>
        );
      default:
        return (
          <div className={`p-4 ${isSelected ? 'ring-2 ring-primary' : ''}`}>
            {block.content}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex gap-6">
            {/* Component Sidebar */}
            <div className="w-64 bg-card rounded-lg shadow p-4">
              <h2 className="text-lg font-medium text-card-foreground mb-4">Components</h2>
              <div className="space-y-2">
                {componentTypes.map(({ type, icon, label }) => (
                  <button
                    key={type}
                    onClick={() => addNewBlock(type as ComponentBlock['type'])}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-card-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Page Canvas */}
            <div className="flex-1">
              <div className="bg-card rounded-lg shadow">
                <div className="p-4 border-b border-border">
                  <div className="flex justify-between items-center">
                    <h1 className="text-lg font-medium text-card-foreground">Page Editor</h1>
                    <button className="btn btn-primary">
                      Save Page
                    </button>
                  </div>
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="page-canvas">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="min-h-[500px] p-4"
                      >
                        {blocks.map((block, index) => (
                          <Draggable key={block.id} draggableId={block.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setSelectedBlock(block.id)}
                                className="mb-4 bg-card rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow"
                              >
                                {renderBlock(block)}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageBuilder;