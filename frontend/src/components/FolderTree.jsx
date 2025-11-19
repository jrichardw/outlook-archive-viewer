import React, { useState } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, Mail } from 'lucide-react';
import './FolderTree.css';

function FolderNode({ folder, selectedFolderId, onSelectFolder, level = 0 }) {
  const [isExpanded, setIsExpanded] = useState(level === 0);

  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedFolderId === folder.id;

  const handleToggle = (e) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSelect = () => {
    onSelectFolder(folder.id, folder.name);
  };

  return (
    <div className="folder-node">
      <div
        className={`folder-item ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={handleSelect}
      >
        <div className="folder-item-content">
          {hasChildren && (
            <button
              className="folder-toggle"
              onClick={handleToggle}
              aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          )}

          {!hasChildren && <span className="folder-spacer"></span>}

          <span className="folder-icon">
            {isExpanded && hasChildren ? (
              <FolderOpen size={18} />
            ) : (
              <Folder size={18} />
            )}
          </span>

          <span className="folder-name">{folder.name}</span>

          {folder.contentCount > 0 && (
            <span className="folder-count">
              <Mail size={14} />
              {folder.contentCount}
            </span>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="folder-children">
          {folder.children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderTree({ folders, selectedFolderId, onSelectFolder, onShowAll }) {
  return (
    <div className="folder-tree">
      <div className="folder-tree-header">
        <h2>Folders</h2>
        <button className="btn-link" onClick={onShowAll}>
          Show All
        </button>
      </div>

      <div className="folder-tree-content">
        {folders.map((folder) => (
          <FolderNode
            key={folder.id}
            folder={folder}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
          />
        ))}
      </div>
    </div>
  );
}
