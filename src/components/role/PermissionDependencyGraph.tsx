// src/components/role/PermissionDependencyGraph.tsx
import React, { useEffect, useRef, useState } from "react";
import {  motion } from "framer-motion";
import { Permission } from "../../types/role";

interface PermissionNode {
  id: string;
  level: number;
  x: number;
  y: number;
  permission: Permission;
}

interface PermissionDependencyGraphProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onSelectPermission: (id: string) => void;
}

export const PermissionDependencyGraph: React.FC<
  PermissionDependencyGraphProps
> = ({ permissions, selectedPermissions, onSelectPermission }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const nodeSize = 120;
  const levelHeight = 100;
  const gapWidth = 40;

  // Update dimensions when container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth - 32, height: clientHeight - 32 }); // Subtract padding
      }
    };

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    updateDimensions(); // Initial measurement

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  const nodes: PermissionNode[] = React.useMemo(() => {
    const calculateDependencyLevels = (
      permId: string,
      visited = new Set<string>()
    ): number => {
      if (visited.has(permId)) return 0;
      visited.add(permId);

      const perm = permissions.find((p) => p.id === permId);
      if (!perm?.dependencies?.length) return 0;

      const childLevels = perm.dependencies.map((depId) =>
        calculateDependencyLevels(depId, visited)
      );

      return Math.max(...childLevels) + 1;
    };

    const levels: Permission[][] = [];
    permissions.forEach((perm) => {
      const level = calculateDependencyLevels(perm.id);
      if (!levels[level]) levels[level] = [];
      levels[level].push(perm);
    });

    // Calculate positions based on container dimensions
    return levels.flatMap((levelPerms, level) =>
      levelPerms.map((perm, index) => ({
        id: perm.id,
        level,
        x: index * (nodeSize + gapWidth),
        y: level * levelHeight,
        permission: perm,
      }))
    );
  }, [permissions]);

  const edges = React.useMemo(() => {
    const result = [];
    for (const node of nodes) {
      const perm = node.permission;
      if (perm.dependencies) {
        for (const depId of perm.dependencies) {
          const depNode = nodes.find((n) => n.id === depId);
          if (depNode) {
            result.push({
              from: node,
              to: depNode,
              selected:
                selectedPermissions.includes(node.id) &&
                selectedPermissions.includes(depId),
            });
          }
        }
      }
    }
    return result;
  }, [nodes, selectedPermissions]);

  // Calculate the required SVG dimensions
  const svgWidth = Math.max(...nodes.map((n) => n.x)) + nodeSize + gapWidth;
  const svgHeight = Math.max(...nodes.map((n) => n.y)) + levelHeight + gapWidth;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[600px] bg-white dark:bg-gray-800 overflow-auto border rounded-lg"
      style={{ height: "calc(100vh - 300px)" }} // Adjust this value based on your layout
    >
      <div className="absolute inset-0 p-4">
        <svg
          width={svgWidth}
          height={svgHeight}
          className="absolute top-0 left-0"
          style={{ minWidth: "100%", minHeight: "100%" }}
        >
          {edges.map((edge, index) => (
            <motion.path
              key={`${edge.from.id}-${edge.to.id}`}
              d={`M ${edge.from.x + nodeSize / 2} ${edge.from.y + nodeSize / 2} 
                  L ${edge.to.x + nodeSize / 2} ${edge.to.y + nodeSize / 2}`}
              strokeWidth="2"
              stroke={edge.selected ? "#6366f1" : "#e5e7eb"}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
          ))}
        </svg>

        {nodes.map((node) => (
          <motion.div
            key={node.id}
            className={`absolute rounded-lg p-3 border ${
              selectedPermissions.includes(node.id)
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900"
                : "border-gray-200 bg-white dark:bg-gray-800"
            } cursor-pointer transition-colors`}
            style={{
              width: nodeSize,
              left: node.x,
              top: node.y,
              zIndex: 1, // Ensure nodes appear above paths
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: node.level * 0.1 }}
            onClick={() => onSelectPermission(node.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-sm font-medium mb-1">
              {node.permission.name}
            </div>
            <div className="text-xs text-gray-500">
              {node.permission.category}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
