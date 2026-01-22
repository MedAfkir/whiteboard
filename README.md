# Whiteboard App

A collaborative whiteboard application built with React, TypeScript, and Zustand for state management.

## Features

- **Drawing Tools:** Pen, rectangle, ellipse, line, and text tools
- **Element Manipulation:** Move, resize, rotate, and delete elements
- **Selection:** Single-click selection, multi-select with Ctrl/Cmd, and drag-to-select
- **Undo/Redo:** Track changes to elements and allow undo/redo operations (not implemented yet)
- **Keyboard Shortcuts:** Support for common whiteboard operations
- **Responsive Design:** Works on different screen sizes

## Features & Issues

Features to be implemented in the future & issues to be fixed:

- **Text Editing:** After adding a text element to the whiteboard, you cannot edit its content inline.
- **Resizing Rotated Shapes:** When resizing a shape that has been rotated (e.g., by 10°), the resize operation does not behave correctly and the shape may distort.
- **Select All / Drag Selection:** When using drag-to-select, some shapes (especially pen/freedraw shapes) are not selected correctly.

These are tracked for future improvement.